import os
import cv2

DIR = './DataBase'
if not os.path.exists(DIR):
    print(f"Creating base directory: {DIR}")
    os.makedirs(DIR)

number_of_classes = 26  
dataset_size = 50

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Can't create capture")
    exit()
else:
    print("Camera initialized successfully")

counter = 0

for j in range(number_of_classes):
    class_dir = os.path.join(DIR, str(j))
    if not os.path.exists(class_dir):
        print(f"Creating directory for class {j}: {class_dir}")
        os.makedirs(class_dir)

    print(f'Collecting data for class {j}. Press "Space" to capture image, "Q" to quit.')

    class_counter = 0

    while class_counter < dataset_size:
        ret, frame = cap.read()
        if not ret:
            print("ERROR: Failed to capture frame. Skipping...")
            continue
        cv2.imshow("Press Space to Capture Image", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord(' '):
            image_path = os.path.join(class_dir, f'{class_counter}.jpg')
            if cv2.imwrite(image_path, frame):
                print(f'Saved {image_path}')
                class_counter += 1
        if key == ord('q'):
            print(f"Quitting the program.")
            break

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("Dataset collection complete!")
