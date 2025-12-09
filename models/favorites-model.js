const pool = require("../database")

async function addFavorite(account_id, inv_id) {
    const sql = `
        INSERT INTO public.favorites (account_id, inv_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
    `
    return pool.query(sql, [account_id, inv_id])
}

async function getFavoritesByAccountId(account_id) {
  const sql = `
    SELECT * 
    FROM public.favorites
    WHERE account_id = $1
    ORDER BY favorite_id ASC
  `
  const result = await pool.query(sql, [account_id])
  return result.rows   // <-- just return rows
}

async function removeFavorite(account_id, inv_id) {
  const sql = `
    DELETE FROM public.favorites
    WHERE account_id = $1 AND inv_id = $2
  `
  return pool.query(sql, [account_id, inv_id])
}

async function isFavorite(account_id, inv_id) {
  const sql = `
    SELECT 1 FROM public.favorites
    WHERE account_id = $1 AND inv_id = $2
  `
  const result = await pool.query(sql, [account_id, inv_id])
  return result.rowCount > 0
}

module.exports = {addFavorite, getFavoritesByAccountId, removeFavorite, isFavorite} 