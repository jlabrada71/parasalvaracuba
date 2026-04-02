import { query } from '../../utils/db'

export default defineEventHandler(async () => {
  try {
    const [ideasRow] = await query<{ count: string }>('SELECT COUNT(*) as count FROM ideas')
    const [problemsRow] = await query<{ count: string }>('SELECT COUNT(*) as count FROM problems')
    const [participantsRow] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT email) as count
      FROM (
        SELECT email FROM ideas
        UNION
        SELECT email FROM votes WHERE email IS NOT NULL
        UNION
        SELECT email FROM problems
        UNION
        SELECT email FROM problem_votes
      ) as contributors
    `)
    const [votesRow] = await query<{ total: string }>(`
      SELECT COALESCE(SUM(vote_value), 0) as total
      FROM (
        SELECT vote_value FROM votes
        UNION ALL
        SELECT vote_value FROM problem_votes
      ) as all_votes
    `)

    return {
      ideas: parseInt(ideasRow?.count ?? '0', 10),
      problems: parseInt(problemsRow?.count ?? '0', 10),
      participants: parseInt(participantsRow?.count ?? '0', 10),
      votes: parseInt(votesRow?.total ?? '0', 10),
    }
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return { ideas: 0, problems: 0, participants: 0, votes: 0 }
  }
})
