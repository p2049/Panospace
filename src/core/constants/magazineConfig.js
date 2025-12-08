// Magazine configuration constants

export const MAGAZINE_CONFIG = {
    ASPECT_RATIO: 8.5 / 11, // Standard magazine ratio (0.7727)
    MIN_SLIDES: 15,
    MAX_SLIDES: 30,
    ALLOW_COVER_SLIDE: true
};

export const RELEASE_FREQUENCIES = [
    { value: 'monthly', label: 'Monthly', days: 30 },
    { value: 'bi-monthly', label: 'Bi-Monthly (Every 2 Months)', days: 60 }
];

export const SUBMISSION_LIMITS = {
    SMALL: { maxMembers: 10, photosPerUser: 3 },
    MEDIUM: { maxMembers: 25, photosPerUser: 2 },
    LARGE: { maxMembers: 100, photosPerUser: 1 }
};

export const getSubmissionLimit = (memberCount) => {
    if (memberCount <= SUBMISSION_LIMITS.SMALL.maxMembers) {
        return SUBMISSION_LIMITS.SMALL.photosPerUser;
    } else if (memberCount <= SUBMISSION_LIMITS.MEDIUM.maxMembers) {
        return SUBMISSION_LIMITS.MEDIUM.photosPerUser;
    } else {
        return SUBMISSION_LIMITS.LARGE.photosPerUser;
    }
};

export const MAGAZINE_ASPECT_RATIO_STRING = '8.5:11';
export const MAGAZINE_ASPECT_RATIO_DECIMAL = 0.7727;
