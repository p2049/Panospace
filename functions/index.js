const { generateThumbnails, regenerateThumbnails } = require('./generateThumbnails');
const {
    getPersonalizedFeed,
    getExploreFeed,
    getParkFeed,
    getCityFeed,
    getEventFeed
} = require('./feedService');
const {
    onPostLiked,
    onPostSaved,
    onPrintPurchased
} = require('./preferenceLearning');
const {
    createContest,
    closeContest,
    calculateWinners,
    distributePrizes
} = require('./contestManagement');
const {
    validateEntry,
    checkOriginalContent,
    checkRequiredTags,
    checkAIArtRestriction
} = require('./entryValidation');
const {
    calculateUserIntegrityScore,
    filterValidLikes,
    detectSuspiciousActivity
} = require('./antiCheat');
const likesLock = require('./likesLockSystem');

// Thumbnail generation
exports.generateThumbnails = generateThumbnails;
exports.regenerateThumbnails = regenerateThumbnails;

// Personalized feeds
exports.getPersonalizedFeed = getPersonalizedFeed;
exports.getExploreFeed = getExploreFeed;
exports.getParkFeed = getParkFeed;
exports.getCityFeed = getCityFeed;
exports.getEventFeed = getEventFeed;

// Preference learning
exports.onPostLiked = onPostLiked;
exports.onPostSaved = onPostSaved;
exports.onPrintPurchased = onPrintPurchased;

// Contest management
exports.createContest = createContest;
exports.closeContest = closeContest;
exports.calculateWinners = calculateWinners;
exports.distributePrizes = distributePrizes;

// Entry validation
exports.validateEntry = validateEntry;
exports.checkOriginalContent = checkOriginalContent;
exports.checkRequiredTags = checkRequiredTags;
exports.checkAIArtRestriction = checkAIArtRestriction;

// Anti-cheat
exports.calculateUserIntegrityScore = calculateUserIntegrityScore;
exports.filterValidLikes = filterValidLikes;
exports.detectSuspiciousActivity = detectSuspiciousActivity;

// Likes lock system (callable functions exported directly from module)
exports.trackWeeklyLike = likesLock.trackWeeklyLike;
exports.checkLikeQualification = likesLock.checkLikeQualification;
exports.getWeeklyLikeStats = likesLock.getWeeklyLikeStats;
exports.decrementWeeklyLike = likesLock.decrementWeeklyLike;

// Post Integrity Check
const { postIntegrityCheck } = require('./postIntegrityCheck');
exports.postIntegrityCheck = postIntegrityCheck;

// Manual Cleanup (callable from client)
const { manualCleanupBrokenPosts } = require('./manualCleanup');
exports.manualCleanupBrokenPosts = manualCleanupBrokenPosts;

