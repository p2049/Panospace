export const calculatePostScore = (post, userDisciplines, followingIds) => {
    let score = 0;
    const postTags = (post.tags || []).map(t => t.toLowerCase());
    const userMain = (userDisciplines.main || []).map(m => m.toLowerCase());
    const userNiches = Object.values(userDisciplines.niches || {}).flat().map(n => n.toLowerCase());

    // 1. Following Bonus (+5)
    if (followingIds.includes(post.authorId)) {
        score += 5;
    }

    // 2. Sub-Niche Bonus (+3 per match)
    const nicheMatches = postTags.filter(tag => userNiches.includes(tag)).length;
    score += nicheMatches * 3;

    // 3. Main Discipline Bonus (+1 per match)
    const mainMatches = postTags.filter(tag => userMain.includes(tag)).length;
    score += mainMatches * 1;

    // 4. Recency Bonus (Decay)
    // Score = 10 / (hours_old + 2)
    // This gives a boost to very new posts but decays quickly
    const hoursOld = (new Date() - (post.createdAt instanceof Date ? post.createdAt : new Date())) / (1000 * 60 * 60);
    score += 10 / (Math.max(0, hoursOld) + 2);

    return score;
};
