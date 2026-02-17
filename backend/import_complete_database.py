"""
Import Complete Database into Production
Run this in Azure SSH after deployment
"""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

def import_all_data():
    """Import ALL data from complete database export"""
    
    # Import all models
    from apps.cms import models as cms_models
    from apps.bookings import models as booking_models
    from apps.invitations import models as invitation_models
    from apps.core import models as core_models
    from apps.shop import models as shop_models
    
    # Read the exported data
    with open('complete_database_export.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("\n📦 Importing Complete Database to Production...")
    print("=" * 70)
    
    total_imported = 0
    
    # Map app names to model modules
    app_modules = {
        'cms': cms_models,
        'bookings': booking_models,
        'invitations': invitation_models,
        'core': core_models,
        'shop': shop_models,
    }
    
    for full_model_name, records in data.items():
        try:
            # Parse app.ModelName format
            if '.' in full_model_name:
                app_name, model_name = full_model_name.split('.')
                
                # Get the correct models module
                if app_name in app_modules:
                    models_module = app_modules[app_name]
                    model_class = getattr(models_module, model_name)
                    
                    # Clear existing data for this model (except for critical data)
                    if model_name not in ['User', 'GlobalSettings']:  # Don't clear users or settings
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
                else:
                    print(f"⚠️  {full_model_name}: Unknown app")
                    
        except AttributeError:
            print(f"⚠️  {full_model_name}: Model not found")
        except Exception as e:
            print(f"❌ {full_model_name}: Error - {str(e)[:100]}")
    
    print(f"\n✅ Import complete!")
    print(f"📊 Total records imported: {total_imported}\n")

if __name__ == '__main__':
    import_all_data()
