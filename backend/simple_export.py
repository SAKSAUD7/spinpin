"""
Simple CMS Data Export - Handles encoding issues
Exports data as Python dictionaries to avoid encoding problems
"""
import os
import sys
import django
import json

# Force UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

def export_cms_data():
    """Export all CMS data to JSON"""
    from apps.cms import models as cms_models
    
    data = {}
    
    # Get all model classes from cms app
    cms_model_names = [
        'Page', 'Activity', 'Banner', 'InstagramReel', 'Faq', 
        'Testimonial', 'SocialLink', 'GalleryItem', 'StatCard', 'MenuSection'
    ]
    
    print("\n🎨 Exporting CMS Data...")
    print("=" * 60)
    
    for model_name in cms_model_names:
        try:
            model_class = getattr(cms_models, model_name)
            records = list(model_class.objects.values())
            data[model_name] = records
            print(f"✅ {model_name}: {len(records)} records")
        except AttributeError:
            print(f"⚠️  {model_name}: Model not found, skipping")
        except Exception as e:
            print(f"❌ {model_name}: Error - {str(e)}")
    
    # Write to file
    output_file = 'cms_data_export.json'
    print(f"\n💾 Writing to {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    
    print(f"✅ Export complete! File: {output_file}\n")
    
    # Print summary
    total_records = sum(len(records) for records in data.values())
    print(f"📊 Total records exported: {total_records}")
    print(f"📦 Models exported: {len(data)}")
    print(f"\n🖼️  Note: Images are already on Azure Blob Storage!\n")

if __name__ == '__main__':
    export_cms_data()
