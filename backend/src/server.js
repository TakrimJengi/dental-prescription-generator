const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

const allowedCategories = ['complaint','examination','diagnosis','investigation','advice'];

app.get('/api/health', async (_req, res) => {
  try { await db.query('SELECT 1'); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ ok: false, error: 'Database connection failed' }); }
});

// Selectable prescription lists
app.get('/api/options', async (_req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, category, label, active, sort_order FROM prescription_options WHERE active=1 ORDER BY category, sort_order, label'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Could not load options' }); }
});

app.get('/api/admin/options', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM prescription_options ORDER BY category, sort_order, label');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Could not load options' }); }
});

app.post('/api/admin/options', async (req, res) => {
  const { category, label, sort_order = 0 } = req.body;
  if (!allowedCategories.includes(category) || !String(label || '').trim())
    return res.status(400).json({ error: 'Choose a valid category and enter a label.' });
  try {
    const [result] = await db.query(
      'INSERT INTO prescription_options (category,label,sort_order) VALUES (?,?,?)',
      [category, String(label).trim(), Number(sort_order) || 0]
    );
    res.status(201).json({ id: result.insertId, category, label: String(label).trim(), active: 1 });
  } catch (e) { res.status(400).json({ error: e.code === 'ER_DUP_ENTRY' ? 'This option already exists in that list.' : 'Could not save option.' }); }
});

app.put('/api/admin/options/:id', async (req, res) => {
  const { category, label, active, sort_order } = req.body;
  if (!allowedCategories.includes(category) || !String(label || '').trim())
    return res.status(400).json({ error: 'Choose a valid category and enter a label.' });
  try {
    await db.query(
      'UPDATE prescription_options SET category=?, label=?, active=?, sort_order=? WHERE id=?',
      [category, String(label).trim(), active ? 1 : 0, Number(sort_order) || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: 'Could not update option. Check for duplicates.' }); }
});

app.delete('/api/admin/options/:id', async (req, res) => {
  try { await db.query('DELETE FROM prescription_options WHERE id=?', [req.params.id]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: 'Could not delete option' }); }
});

// Medicine catalogue
app.get('/api/medicines', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM medicines WHERE active=1 ORDER BY name');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Could not load medicines' }); }
});
app.get('/api/admin/medicines', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM medicines ORDER BY name');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Could not load medicines' }); }
});
app.post('/api/admin/medicines', async (req, res) => {
  const m = req.body;
  if (!String(m.name || '').trim()) return res.status(400).json({ error: 'Medicine name is required.' });
  try {
    const [r] = await db.query(
      `INSERT INTO medicines (name,generic_name,strength,form,route,default_dose,default_frequency,default_duration,notes)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [m.name.trim(),m.generic_name||'',m.strength||'',m.form||'',m.route||'',m.default_dose||'',m.default_frequency||'',m.default_duration||'',m.notes||'']
    );
    res.status(201).json({ id:r.insertId });
  } catch(e) { res.status(500).json({ error:'Could not save medicine.' }); }
});
app.put('/api/admin/medicines/:id', async (req, res) => {
  const m = req.body;
  if (!String(m.name || '').trim()) return res.status(400).json({ error: 'Medicine name is required.' });
  try {
    await db.query(
      `UPDATE medicines SET name=?,generic_name=?,strength=?,form=?,route=?,default_dose=?,default_frequency=?,default_duration=?,notes=?,active=? WHERE id=?`,
      [m.name.trim(),m.generic_name||'',m.strength||'',m.form||'',m.route||'',m.default_dose||'',m.default_frequency||'',m.default_duration||'',m.notes||'',m.active?1:0,req.params.id]
    );
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ error:'Could not update medicine.' }); }
});
app.delete('/api/admin/medicines/:id', async (req, res) => {
  try { await db.query('DELETE FROM medicines WHERE id=?', [req.params.id]); res.json({ ok:true }); }
  catch(e) { res.status(500).json({ error:'Could not delete medicine.' }); }
});

// Clinic header/footer
app.get('/api/settings', async (_req,res) => {
  try { const [rows] = await db.query('SELECT * FROM clinic_settings WHERE id=1'); res.json(rows[0] || {}); }
  catch(e) { res.status(500).json({ error:'Could not load clinic settings' }); }
});
app.put('/api/settings', async (req,res) => {
  const s = req.body;
  try {
    await db.query(
      `UPDATE clinic_settings SET clinic_name=?,doctor_name=?,qualifications=?,registration_no=?,address=?,phone=?,email=?,footer_text=? WHERE id=1`,
      [s.clinic_name||'',s.doctor_name||'',s.qualifications||'',s.registration_no||'',s.address||'',s.phone||'',s.email||'',s.footer_text||'']
    );
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ error:'Could not save settings' }); }
});

app.use((err,_req,res,_next) => {
  console.error(err);
  res.status(500).json({ error:'Unexpected server error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running at http://localhost:${port}`));
