const Item = require("../models/Item");
const Notification = require("../models/Notification");

// Stopwords to filter out before keyword matching
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were",
  "in", "on", "at", "to", "for", "with", "by", "of", "from", "my",
  "your", "his", "her", "their", "its", "this", "that", "these", "those"
]);

// Clean string: convert to lowercase, remove punctuation, split into tokens, and filter stop words
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

// Calculate similarity score between two token arrays (Jaccard-like intersection / union)
function calculateSimilarity(tokens1, tokens2) {
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Configurable threshold (between 0 and 100)
const MATCH_THRESHOLD = 30;

// Calculate confidence score between 0 and 100
// Weights: Title (40 points), Description (35 points), Location (25 points)
function getConfidenceScore(item1, item2) {
  // 1. Title similarity (worth up to 40 points)
  const titleTokens1 = tokenize(item1.title);
  const titleTokens2 = tokenize(item2.title);
  const titleSim = calculateSimilarity(titleTokens1, titleTokens2);
  const titleScore = titleSim * 40;

  // 2. Description similarity (worth up to 35 points)
  const descTokens1 = tokenize(item1.description);
  const descTokens2 = tokenize(item2.description);
  const descriptionSim = calculateSimilarity(descTokens1, descTokens2);
  const descriptionScore = descriptionSim * 35;

  // 3. Location similarity (worth up to 25 points)
  const locTokens1 = tokenize(item1.location);
  const locTokens2 = tokenize(item2.location);
  const locationSim = calculateSimilarity(locTokens1, locTokens2);
  const locationScore = locationSim * 25;

  console.log(`[MatchingService]   Title tokens: [${titleTokens1}] vs [${titleTokens2}] → sim=${titleSim.toFixed(3)} → ${titleScore.toFixed(1)} pts`);
  console.log(`[MatchingService]   Location tokens: [${locTokens1}] vs [${locTokens2}] → sim=${locationSim.toFixed(3)} → ${locationScore.toFixed(1)} pts`);
  console.log(`[MatchingService]   Description tokens: [${descTokens1}] vs [${descTokens2}] → sim=${descriptionSim.toFixed(3)} → ${descriptionScore.toFixed(1)} pts`);

  return Math.round(titleScore + descriptionScore + locationScore);
}

// Check and trigger matching logic for a newly created or updated item
const checkMatches = async (newItem) => {
  try {
    console.log(`\n[MatchingService] ========== MATCHING PIPELINE START ==========`);
    console.log(`[MatchingService] New/Updated item: "${newItem.title}" (type=${newItem.type}, category=${newItem.category}, id=${newItem._id})`);
    console.log(`[MatchingService] User ID: ${newItem.userId}`);

    // If item is not active, do not run matches
    if (newItem.status !== "active") {
      console.log(`[MatchingService] Item status is "${newItem.status}", not "active". Skipping.`);
      console.log(`[MatchingService] ========== MATCHING PIPELINE END ==========\n`);
      return;
    }

    const isLost = newItem.type === "lost";
    const oppositeType = isLost ? "found" : "lost";

    console.log(`[MatchingService] Searching for: type=${oppositeType}, category=${newItem.category}, status=active, userId≠${newItem.userId}`);

    // 1. Find candidates: opposite type, same category, status active, different user
    const candidates = await Item.find({
      type: oppositeType,
      category: newItem.category,
      status: "active",
      userId: { $ne: newItem.userId },
    });

    console.log(`[MatchingService] Found ${candidates.length} candidate(s)`);

    if (candidates.length === 0) {
      console.log(`[MatchingService] No candidates — pipeline ends.`);
      console.log(`[MatchingService] ========== MATCHING PIPELINE END ==========\n`);
      return;
    }

    for (const candidate of candidates) {
      console.log(`\n[MatchingService] --- Evaluating candidate: "${candidate.title}" (id=${candidate._id}, user=${candidate.userId}) ---`);

      // 2. Date check: Found date must NOT be earlier than Lost date
      const lostDate = isLost ? newItem.dateLost : candidate.dateLost;
      const foundDate = isLost ? candidate.dateFound : newItem.dateFound;

      console.log(`[MatchingService]   Date check: lostDate=${lostDate}, foundDate=${foundDate}`);

      if (lostDate && foundDate) {
        if (new Date(foundDate) < new Date(lostDate)) {
          console.log(`[MatchingService]   ❌ SKIPPED: Found date is before lost date`);
          continue;
        }
        console.log(`[MatchingService]   ✅ Date check passed`);
      } else {
        console.log(`[MatchingService]   ⚠️ Date check skipped (one or both dates are null)`);
      }

      // 3. Calculate confidence score (0-100)
      const score = getConfidenceScore(newItem, candidate);
      console.log(`[MatchingService]   Final confidence score: ${score}% (threshold: ${MATCH_THRESHOLD}%)`);

      // 4. Threshold check
      if (score >= MATCH_THRESHOLD) {
        console.log(`[MatchingService]   ✅ Score meets threshold!`);

        // 5. Prevent duplicates: check if a notification pair already exists
        const duplicateExists = await Notification.findOne({
          $or: [
            { itemId: newItem._id, relatedItemId: candidate._id },
            { itemId: candidate._id, relatedItemId: newItem._id }
          ]
        });

        if (duplicateExists) {
          console.log(`[MatchingService]   ❌ SKIPPED: Duplicate notification already exists`);
          continue;
        }
        console.log(`[MatchingService]   ✅ No duplicate found`);

        // Determine owner IDs
        const lostItem = isLost ? newItem : candidate;
        const foundItem = isLost ? candidate : newItem;

        // 6. Create Notification for the Lost Item Owner
        const notif1 = await Notification.create({
          userId: lostItem.userId,
          itemId: lostItem._id,
          relatedItemId: foundItem._id,
          message: `Match Found! A "${foundItem.title}" matches your lost item post with a confidence score of ${score}%.`,
        });
        console.log(`[MatchingService]   ✅ Notification created for lost item owner (notif id=${notif1._id})`);

        // 7. Create Notification for the Found Item Reporter
        const notif2 = await Notification.create({
          userId: foundItem.userId,
          itemId: foundItem._id,
          relatedItemId: lostItem._id,
          message: `Possible Owner Identified! A "${lostItem.title}" matches your found item post with a confidence score of ${score}%.`,
        });
        console.log(`[MatchingService]   ✅ Notification created for found item reporter (notif id=${notif2._id})`);

        console.log(`[MatchingService]   🎉 Match registered between "${lostItem.title}" and "${foundItem.title}" (${score}% confidence)`);
      } else {
        console.log(`[MatchingService]   ❌ Score ${score}% below threshold ${MATCH_THRESHOLD}% — no match`);
      }
    }

    console.log(`[MatchingService] ========== MATCHING PIPELINE END ==========\n`);
  } catch (error) {
    console.error("[MatchingService] ❌ ERROR in matching pipeline:", error.message);
    console.error(error.stack);
  }
};

// Get potential matches for a single item dynamically
const getMatchesForItem = async (item) => {
  const isLost = item.type === "lost";
  const oppositeType = isLost ? "found" : "lost";

  // Find active candidates from other users (or any other user, keeping it from different users)
  const candidates = await Item.find({
    _id: { $ne: item._id },
    userId: { $ne: item.userId },
    type: oppositeType,
    category: item.category,
    status: "active",
  }).populate("userId", "username profilePicture");

  const matches = [];

  for (const candidate of candidates) {
    const lostDate = isLost ? item.dateLost : candidate.dateLost;
    const foundDate = isLost ? candidate.dateFound : item.dateFound;

    if (lostDate && foundDate) {
      if (new Date(foundDate) < new Date(lostDate)) {
        continue;
      }
    }

    const score = getConfidenceScore(item, candidate);
    if (score >= MATCH_THRESHOLD) {
      matches.push({
        item: candidate,
        score
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
};

module.exports = { checkMatches, getMatchesForItem };
