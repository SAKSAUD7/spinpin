import os
import django
from django.conf import settings
from azure.storage.blob import BlobServiceClient, ContentSettings
import mimetypes

# Setup Django configuration
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

MEDIA_ROOT = r'C:\Users\saksa\OneDrive\Desktop\yoyopark\ninjainflatablepark11\park1\backend\media\uploads'

def upload_local_files_to_azure():
    # Get connection string from settings
    conn_str = settings.STORAGES['default']['OPTIONS']['connection_string']
    container_name = settings.STORAGES['default']['OPTIONS']['azure_container']
    
    print(f"🚀 Connecting to Azure Storage Account...")
    
    try:
        blob_service_client = BlobServiceClient.from_connection_string(conn_str)
        
        # Create container if it doesn't exist
        container_client = blob_service_client.get_container_client(container_name)
        if not container_client.exists():
            print(f"🔨 Creating container '{container_name}'...")
            container_client.create_container(public_access="blob")
            print(f"✅ Container '{container_name}' created!")
        else:
            print(f"✅ Container '{container_name}' already exists.")

        count = 0
        total_files = 0
        
        # Walk through local media directory
        print(f"\n📂 Scanning {MEDIA_ROOT}...")
        for root, dirs, files in os.walk(MEDIA_ROOT):
            for filename in files:
                total_files += 1
                local_path = os.path.join(root, filename)
                
                # Construct relative path for Azure (e.g. 'uploads/image.jpg')
                relative_path = os.path.relpath(local_path, start=os.path.dirname(MEDIA_ROOT))
                cloud_path = relative_path.replace('\\', '/')
                
                # Get Content Type
                content_type, _ = mimetypes.guess_type(local_path)
                content_settings = ContentSettings(content_type=content_type)

                print(f"⬆️  Uploading ({count+1}): {cloud_path}...")
                
                blob_client = container_client.get_blob_client(cloud_path)
                
                try:
                    with open(local_path, 'rb') as data:
                        blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)
                        count += 1
                except Exception as e:
                    print(f"❌ Failed to upload {cloud_path}: {e}")

        print(f"\n🎉 DONE! Uploaded {count}/{total_files} files.")

    except Exception as e:
        print(f"❌ Critical Error: {e}")

if __name__ == "__main__":
    upload_local_files_to_azure()
