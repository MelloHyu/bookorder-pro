import express from 'express';
import supabase from '../lib/supabase.js';
import requireAuth from '../middleware/requireAuth.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

// GET /api/dispatch/orders - all orders for publisher dashboard
router.get('/orders', requireAuth, requireRole('publisher'), async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      customers ( name, address, book_in_charge ),
      users ( rep_id, username ),
      order_items ( book_title, quantity )
    `)
    .order('order_date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/dispatch/orders/:id - publisher edits any order field
router.patch('/orders/:id', requireAuth, requireRole('publisher'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

export default router;