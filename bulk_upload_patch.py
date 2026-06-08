import os

path = os.path.expanduser('~/mainedit/src/pages/Admin.js')
with open(path, 'r') as f:
    content = f.read()

bulk_tab_button = "activeTab === 'upload'"
if 'bulk' not in content:
    # Add bulk tab button after upload tab button
    content = content.replace(
        "onClick={() => setActiveTab('upload')}",
        "onClick={() => setActiveTab('upload')}\n          style={{ background: activeTab === 'upload' ? 'var(--primary)' : '' }}>\n            📦 Upload\n          </button>\n          <button className=\"tab-btn\" onClick={() => setActiveTab('bulk')}\n          style={{ background: activeTab === 'bulk' ? 'var(--primary)' : '' }}>\n            📦 Bulk Upload",
        1
    )

bulk_section = """
      {activeTab === 'bulk' && (
        <div className="upload-form">
          <h2 style={{ color: 'var(--primary)', marginBottom: 16 }}>📦 BULK UPLOAD SOUND EFFECTS</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 16, fontSize: 14 }}>Select multiple MP3 files at once. Fill in details for each, then upload all.</p>
          <div className="input-group">
            <label>Select Multiple MP3 Files *</label>
            <input type="file" accept="audio/*" multiple className="input-field"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setBulkFiles(files.map(f => ({
                  file: f,
                  title: f.name.replace(/\\.mp3$/i,'').replace(/_/g,' '),
                  description: '',
                  price: '',
                  category: 'general',
                  status: 'pending'
                })));
              }} />
          </div>
          {bulkFiles.length > 0 && (
            <div>
              <p style={{ color: 'var(--text2)', marginBottom: 12, fontSize: 13 }}>{bulkFiles.length} file(s) selected. Fill in details:</p>
              {bulkFiles.map((item, idx) => (
                <div key={idx} style={{ background: 'var(--card)', borderRadius: 12, padding: 16, marginBottom: 12, border: item.status === 'done' ? '1px solid #00ff88' : item.status === 'error' ? '1px solid #ff4444' : '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: 8, fontSize: 13 }}>
                    🎵 {item.file.name}
                    {item.status === 'done' && <span style={{ color: '#00ff88', marginLeft: 8 }}>✅ Uploaded</span>}
                    {item.status === 'error' && <span style={{ color: '#ff4444', marginLeft: 8 }}>❌ Failed</span>}
                    {item.status === 'uploading' && <span style={{ color: '#ffaa00', marginLeft: 8 }}>⏳ Uploading...</span>}
                  </p>
                  <input className="input-field" placeholder="Title *" value={item.title} style={{ marginBottom: 8 }}
                    onChange={e => { const b = [...bulkFiles]; b[idx].title = e.target.value; setBulkFiles(b); }} />
                  <input className="input-field" placeholder="Description" value={item.description} style={{ marginBottom: 8 }}
                    onChange={e => { const b = [...bulkFiles]; b[idx].description = e.target.value; setBulkFiles(b); }} />
                  <input className="input-field" type="number" placeholder="Price (USD) *" value={item.price} style={{ marginBottom: 8 }}
                    onChange={e => { const b = [...bulkFiles]; b[idx].price = e.target.value; setBulkFiles(b); }} />
                  <select className="input-field" value={item.category}
                    onChange={e => { const b = [...bulkFiles]; b[idx].category = e.target.value; setBulkFiles(b); }}>
                    {['general','horror','funny','romantic','action','crying','nature','cinematic'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
              {bulkMsg && <div className={bulkMsg.includes('❌') ? 'alert alert-error' : 'alert alert-success'} style={{ marginBottom: 12 }}>{bulkMsg}</div>}
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={bulkUploading}
                onClick={async () => {
                  setBulkUploading(true);
                  setBulkMsg('');
                  let successCount = 0;
                  for (let i = 0; i < bulkFiles.length; i++) {
                    const item = bulkFiles[i];
                    if (item.status === 'done') continue;
                    if (!item.title || !item.price) {
                      const b = [...bulkFiles]; b[i].status = 'error'; setBulkFiles(b);
                      continue;
                    }
                    const b = [...bulkFiles]; b[i].status = 'uploading'; setBulkFiles([...b]);
                    try {
                      const fileName = Date.now() + '_' + item.file.name;
                      const { data: audioData, error: audioError } = await supabase.storage.from('effects').upload('audio/' + fileName, item.file, { contentType: 'audio/mpeg' });
                      if (audioError) throw audioError;
                      const { data: urlData } = supabase.storage.from('effects').getPublicUrl('audio/' + fileName);
                      await supabase.from('sound_effects').insert({
                        title: item.title,
                        description: item.description,
                        price: parseFloat(item.price),
                        category: item.category,
                        audio_url: urlData.publicUrl,
                        preview_url: null,
                        cover_url: null,
                        downloads: 0
                      });
                      const nb = [...bulkFiles]; nb[i].status = 'done'; setBulkFiles([...nb]);
                      successCount++;
                    } catch(e) {
                      const nb = [...bulkFiles]; nb[i].status = 'error'; setBulkFiles([...nb]);
                    }
                  }
                  setBulkMsg('✅ Done! ' + successCount + ' of ' + bulkFiles.length + ' effects uploaded.');
                  setBulkUploading(false);
                }}>
                {bulkUploading ? '⏳ Uploading...' : '📦 Upload All Effects'}
              </button>
            </div>
          )}
        </div>
      )}
"""

# Insert bulk section before the closing of the main tab content area
content = content.replace(
    "{activeTab === 'upload' &&",
    bulk_section + "\n      {activeTab === 'upload' &&"
)

# Add bulk state variables after existing upload states
content = content.replace(
    "const [uploading, setUploading] = useState(false);",
    "const [uploading, setUploading] = useState(false);\n  const [bulkFiles, setBulkFiles] = useState([]);\n  const [bulkUploading, setBulkUploading] = useState(false);\n  const [bulkMsg, setBulkMsg] = useState('');"
)

with open(path, 'w') as f:
    f.write(content)

print("Done! Bulk upload section added.")
