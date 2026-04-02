import { query } from '../../utils/db'

export default defineEventHandler(async () => {
  try {
    const [ideasRow] = await query<{ count: string }>('SELECT COUNT(*) as count FROM ideas')
    const [participantsRow] = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT email) as count
      FROM (
        SELECT email FROM ideas
        UNION
        SELECT email FROM votes WHERE email IS NOT NULL
      ) as contributors
    `)
    const [votesRow] = await query<{ total: string }>('SELECT COALESCE(SUM(vote_value), 0) as total FROM votes')

    return {
      ideas: parseInt(ideasRow?.count ?? '0', 10),
      participants: parseInt(participantsRow?.count ?? '0', 10),
      votes: parseInt(votesRow?.total ?? '0', 10),
    }
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return { ideas: 0, participants: 0, votes: 0 }
  }
})
