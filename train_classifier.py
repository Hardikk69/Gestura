import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np
import collections

# Load dataset
data_dict = pickle.load(open('./data.pickle', 'rb'))
print(f"Number of samples: {len(data_dict['data'])}, Labels: {len(data_dict['labels'])}")

# Check if dataset is empty
if len(data_dict['data']) == 0:
    raise ValueError("Dataset is empty! Run create_dataset.py again and check for errors.")

data = np.asarray(data_dict['data'])
labels = np.asarray(data_dict['labels'])

# Check label distribution
label_counts = collections.Counter(labels)
print("Label distribution:", label_counts)
print("Label count", len(label_counts))

# Ensure each class has at least 2 samples
min_samples = min(label_counts.values())
if min_samples < 2:
    print("Warning: Some classes have only 1 sample. Removing stratify.")
    stratify = None
else:
    stratify = labels

# Split dataset
x_train, x_test, y_train, y_test = train_test_split(
    data, labels, test_size=0.2, shuffle=True, stratify=stratify
)

# Train model
model = RandomForestClassifier()
model.fit(x_train, y_train)

# Evaluate model
y_predict = model.predict(x_test)
score = accuracy_score(y_predict, y_test)
print(f'{score * 100:.2f}% of samples were classified correctly!')

# Save trained model
with open('model.p', 'wb') as f:
    pickle.dump({'model': model}, f)
