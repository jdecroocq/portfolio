import os
import sys
from PIL import Image

def resize_images_for_web(full_dir_path):
    """
    Redimensionne les images d'un dossier 'full' pour créer des versions web.
    La dimension la plus longue de chaque image ne dépassera pas max_size.
    """
    max_size = 1600
    jpeg_quality = 85

    if not os.path.isdir(full_dir_path) or os.path.basename(full_dir_path.rstrip('/\\')) != 'full':
        print("\nErreur : Le chemin fourni n'est pas un dossier valide ou ne s'appelle pas 'full'.")
        print("Veuillez fournir le chemin vers le dossier contenant les images en haute résolution.")
        return

    parent_dir = os.path.dirname(full_dir_path)
    web_dir_path = os.path.join(parent_dir, 'web')

    if not os.path.exists(web_dir_path):
        os.makedirs(web_dir_path)
        print(f"\nDossier '{web_dir_path}' créé.")

    print(f"\nAnalyse du dossier : {full_dir_path}")
    print(f"Les images optimisées seront sauvegardées dans : {web_dir_path}")
    print("-" * 30)

    files_in_full = os.listdir(full_dir_path)
    image_files = [f for f in files_in_full if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]

    if not image_files:
        print("Aucune image trouvée dans le dossier 'full'.")
        return

    for filename in image_files:
        try:
            image_path = os.path.join(full_dir_path, filename)
            
            with Image.open(image_path) as img:
                original_width, original_height = img.size
                print(f"Traitement de '{filename}' ({original_width}x{original_height})...")

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
                
                if resized_img.mode == 'RGBA' or resized_img.mode == 'P':
                    resized_img = resized_img.convert('RGB')

                resized_img.save(output_path, 'jpeg', quality=jpeg_quality, optimize=True)
                print(f"  -> Sauvegardé en '{output_path}' ({new_size[0]}x{new_size[1]})")

        except Exception as e:
            print(f"  Erreur lors du traitement de '{filename}': {e}")

    print("-" * 30)
    print("Opération terminée !")


if __name__ == "__main__":
    print("--- Script de Redimensionnement d'Images pour le Web ---")
    try:
        input_path = input("Veuillez saisir le chemin du dossier 'full' ici, puis appuyez sur Entrée : ").strip()

        if input_path.startswith('"') and input_path.endswith('"'):
            input_path = input_path[1:-1]
            
        resize_images_for_web(input_path)
    except KeyboardInterrupt:
        print("\nProgramme interrompu par l'utilisateur.")
        sys.exit(0)
