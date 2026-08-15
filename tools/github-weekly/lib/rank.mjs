function normalizedText(project) {
  return [project.repo, project.description, project.language, ...(project.topics || [])].filter(Boolean).join(' ').toLowerCase();
}

export function calculateScore(project, interests = []) {
  const text = normalizedText(project);
  const interestMatches = interests.filter((interest) => text.includes(interest.toLowerCase())).length;
  const weeklyHeat = Math.log10((project.weeklyStars || 0) + 1) * 55;
  const totalHeat = Math.log10((project.stars || 0) + 1) * 20;
  const trendingBonus = project.sources?.includes('trending') ? Math.max(0, 30 - (project.trendingRank || 30)) : 0;
  const newBonus = project.sources?.includes('new-repository') ? 18 : 0;
  const readmeBonus = project.readme?.length > 1200 ? 10 : project.readme?.length > 200 ? 5 : 0;
  return Number((weeklyHeat + totalHeat + trendingBonus + newBonus + interestMatches * 16 + readmeBonus).toFixed(2));
}

export function rankRepositories(projects, config, previouslyPublished = []) {
  const blocked = new Set((config.excludeTopics || []).map((topic) => topic.toLowerCase()));
  const published = new Set(previouslyPublished.map((repo) => repo.toLowerCase()));
  const ownerCounts = new Map();

  return projects
    .filter((project) => project.repo && !project.archived && !project.disabled && !project.fork)
    .filter((project) => !(project.topics || []).some((topic) => blocked.has(topic.toLowerCase())))
    .filter((project) => project.description || (project.readme && project.readme.length >= 200))
    .map((project) => ({
      ...project,
      score: calculateScore(project, config.interests),
      previouslyPublished: published.has(project.repo.toLowerCase())
    }))
    .sort((a, b) => (a.previouslyPublished - b.previouslyPublished) || (b.score - a.score))
    .filter((project) => {
      const owner = (project.owner || '').toLowerCase();
      const count = ownerCounts.get(owner) || 0;
      if (count >= config.maxPerOwner) return false;
      ownerCounts.set(owner, count + 1);
      return true;
    })
    .slice(0, config.maxProjects);
}
