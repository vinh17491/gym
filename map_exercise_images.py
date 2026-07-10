import pyodbc, os

conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=DESKTOP-0PI1Q6Q;DATABASE=gymer;UID=sa;PWD=MySecretPass123')
cur = conn.cursor()

# Get all image files grouped by folder
image_root = 'D:/gymer/image'
folder_files = {}
for folder in os.listdir(image_root):
    fpath = os.path.join(image_root, folder)
    if not os.path.isdir(fpath): continue
    files = sorted([f for f in os.listdir(fpath) if f.endswith('.webp')])
    if files:
        folder_files[folder] = files

# Exercise → folder mapping (equipment/name based)
exercise_folder = {
    'Barbell Bench Press': 'olympic-barbell',
    'Incline Dumbbell Press': 'hex-dumbbell',
    'Decline Barbell Press': 'olympic-barbell',
    'Dumbbell Flyes': 'hex-dumbbell',
    'Push-ups': 'bench',
    'Cable Crossover': 'cable-machine',
    'Pull-ups': 'lat-pulldown',
    'Deadlift': 'olympic-barbell',
    'Barbell Row': 'olympic-barbell',
    'Lat Pulldown': 'lat-pulldown',
    'Seated Cable Row': 'cable-machine',
    'Dumbbell Row': 'hex-dumbbell',
    'Barbell Squat': 'squat-rack',
    'Leg Press': 'leg-press',
    'Romanian Deadlift': 'olympic-barbell',
    'Leg Curl': 'leg-press',
    'Leg Extension': 'leg-press',
    'Walking Lunges': 'hex-dumbbell',
    'Calf Raises': 'exercise-bike',
    'Standing Dumbbell Press': 'hex-dumbbell',
    'Lateral Raise': 'hex-dumbbell',
    'Front Raise': 'hex-dumbbell',
    'Face Pull': 'cable-machine',
    'Arnold Press': 'hex-dumbbell',
    'EZ Bar Curl': 'ez-bar',
    'Hammer Curl': 'hex-dumbbell',
    'Concentration Curl': 'hex-dumbbell',
    'Tricep Pushdown': 'cable-machine',
    'Close-Grip Bench Press': 'olympic-barbell',
    'Overhead Tricep Extension': 'hex-dumbbell',
    'Skull Crushers': 'ez-bar',
    'Plank': 'yoga-block',
    'Cable Crunch': 'cable-machine',
    'Hanging Leg Raise': 'lat-pulldown',
    'Russian Twist': 'yoga-block',
    'Farmers Walk': 'hex-dumbbell',
    'Burpees': 'jump-rope',
    'Clean and Press': 'olympic-barbell',
    'Kettlebell Swing': 'kettlebell',
    'Pull-up (Assisted)': 'lat-pulldown',
    'Diamond Push-ups': 'bench',
    'Pistol Squat': 'leg-press',
    'Dips': 'bench',
    'Glute Bridge': 'foam-roller',
    'Hyperextension': 'bench',
    'Dumbbell Shrug': 'hex-dumbbell',
    'Preacher Curl': 'ez-bar',
    'Lying Leg Curl': 'leg-press',
    'Cable Kickback': 'cable-machine',
    'Reverse Fly': 'hex-dumbbell',
}

# Map each exercise to a first image in its folder
cur.execute('SELECT id, name, equipment FROM Exercises ORDER BY id')
exercises = cur.fetchall()

updated = 0
no_folder = []

for ex in exercises:
    ex_id, ex_name, ex_equip = ex[0], ex[1], ex[2]
    folder = exercise_folder.get(ex_name)
    if not folder:
        no_folder.append(ex_name)
        continue
    files = folder_files.get(folder, [])
    if not files:
        no_folder.append(f'{ex_name} -> {folder} (no files)')
        continue
    # Pick the first file
    img_file = files[0]
    thumb_url = f'/image/{folder}/{img_file}'
    cur.execute('UPDATE Exercises SET thumbnail_url = ? WHERE id = ?', thumb_url, ex_id)
    print(f'{ex_id:2d}|{ex_name:30s}|{thumb_url}')
    updated += 1

conn.commit()

print(f'\nUpdated: {updated}')
if no_folder:
    print(f'Missing: {no_folder}')
