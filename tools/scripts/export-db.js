/**
 * export-db.js
 * 
 * Utility script to export the current LocalStorage database to a JSON format.
 * Since this is a client-side project, this script illustrates how to access 
 * the 'staff_mng_db' key.
 * 
 * Usage: Run in Browser Console or integrate into a backup utility.
 */

function exportDatabase() {
  const dbName = 'staff_mng_db';
  const data = localStorage.getItem(dbName);
  
  if (!data) {
    console.warn(`No database found under key: ${dbName}`);
    return;
  }
  
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `staff_mng_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  console.log('Database export triggered successfully.');
}

// exportDatabase(); 
