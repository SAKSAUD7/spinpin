"""
Import CMS Data into Production Database
Run this script in Azure SSH console
"""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

def import_cms_data():
    """Import CMS data from JSON file"""
    from apps.cms import models as cms_models
    
    # Read the exported data
    with open('cms_data_export.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("\n🎨 Importing CMS Data to Production...")
    print("=" * 60)
    
    total_imported = 0
    
    for model_name, records in data.items():
        try:
            model_class = getattr(cms_models, model_name)
            
            # Clear existing data for this model
            existing_count = model_class.objects.count()
            if existing_count > 0:
                print(f"⚠️  {model_name}: Deleting {existing_count} existing records...")
                model_class.objects.all().delete()
            
            # Import new data
            imported = 0
            for record in records:
                try:
                    model_class.objects.create(**record)
                    imported += 1
                except Exception as e:
                    print(f"   ❌ Error importing record: {str(e)[:100]}")
            
            print(f"✅ {model_name}: Imported {imported}/{len(records)} records")
            total_imported += imported
            
        except AttributeError:
            print(f"⚠️  {model_name}: Model not found, skipping")
        except Exception as e:
            print(f"❌ {model_name}: Error - {str(e)}")
    
    print(f"\n✅ Import complete!")
    print(f"📊 Total records imported: {total_imported}\n")

if __name__ == '__main__':
    import_cms_data()
