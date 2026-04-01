export default defineEventHandler(async (event) => {
  const db = useDatabase()

  try {
    // Get total ideas
    const ideasResult = await db.query('SELECT COUNT(*) as count FROM ideas')
    const ideas = ideasResult.rows[0]?.count || 0

    // Get unique participants (people who submitted ideas or voted)
    const participantsResult = await db.query(`
      SELECT COUNT(DISTINCT email) as count
      FROM (
        SELECT email FROM ideas
        UNION
        SELECT email FROM votes WHERE email IS NOT NULL
      ) as contributors
    `)
    const participants = participantsResult.rows[0]?.count || 0

    // Get total votes (sum of net_votes)
    const votesResult = await db.query('SELECT COALESCE(SUM(net_votes), 0) as total FROM ideas')
    const votes = votesResult.rows[0]?.total || 0

    return {
      ideas,
      participants,
      votes,
    }
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return {
      ideas: 0,
      participants: 0,
      votes: 0,
    }
  }
})
