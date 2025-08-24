import os
import sys
from PIL import Image

def resize_images_for_web(full_dir_path):
    """
    Resizes images in a 'full' folder to create web-optimized versions.
    The longest dimension of each image will not exceed max_size.
    """
    max_size = 1600
    jpeg_quality = 85

    if not os.path.isdir(full_dir_path) or os.path.basename(full_dir_path.rstrip('/\\')) != 'full':
        print("\nError: The provided path is not a valid directory or is not named 'full'.")
        print("Please provide the path to the folder containing high-resolution images.")
        return

    parent_dir = os.path.dirname(full_dir_path)
    web_dir_path = os.path.join(parent_dir, 'web')

    if not os.path.exists(web_dir_path):
        os.makedirs(web_dir_path)
        print(f"\nFolder '{web_dir_path}' created.")

    print(f"\nAnalyzing folder: {full_dir_path}")
    print(f"Optimized images will be saved in: {web_dir_path}")
    print("-" * 30)

    files_in_full = os.listdir(full_dir_path)
    image_files = [f for f in files_in_full if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]

    if not image_files:
        print("No images found in the 'full' folder.")
        return

    for filename in image_files:
        try:
            image_path = os.path.join(full_dir_path, filename)
            
            with Image.open(image_path) as img:
                original_width, original_height = img.size
                print(f"Processing '{filename}' ({original_width}x{original_height})...")

                if original_width <= max_size and original_height <= max_size:
                    new_size = (original_width, original_height)
                elif original_width > original_height:
                    new_width = max_size
                    new_height = int(original_height * (max_size / original_width))
                    new_size = (new_width, new_height)
                else:
                    new_height = max_size
                    new_width = int(original_width * (max_size / original_height))
                    new_size = (new_width, new_height)

                resized_img = img.resize(new_size, Image.Resampling.LANCZOS)

                base_filename = os.path.splitext(filename)[0]
                output_path = os.path.join(web_dir_path, f"{base_filename}.jpg")
                
                if resized_img.mode in ('RGBA', 'P'):
                    resized_img = resized_img.convert('RGB')

                resized_img.save(output_path, 'jpeg', quality=jpeg_quality, optimize=True)
                print(f"  -> Saved as '{output_path}' ({new_size[0]}x{new_size[1]})")

        except Exception as e:
            print(f"  Error processing '{filename}': {e}")

    print("-" * 30)
    print("Operation completed!")


if __name__ == "__main__":
    print("--- Image Resizing Script for the Web ---")
    try:
        input_path = input("Please enter the path to the 'full' folder, then press Enter: ").strip()

        if input_path.startswith('"') and input_path.endswith('"'):
            input_path = input_path[1:-1]
            
        resize_images_for_web(input_path)
    except KeyboardInterrupt:
        print("\nProgram interrupted by user.")
        sys.exit(0)
