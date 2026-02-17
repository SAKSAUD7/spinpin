"""
Import Sample Booking Data into Production
Run this in Azure SSH after deployment
"""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

def import_sample_data():
    """Import sample booking data and settings"""
    from apps.bookings import models as booking_models
    from apps.invitations import models as invitation_models
    from apps.core import models as core_models
    
    # Read the exported data
    with open('sample_booking_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("\n📋 Importing Sample Booking Data to Production...")
    print("=" * 60)
    
    total_imported = 0
    
    for full_model_name, records in data.items():
        try:
            # Parse app.ModelName format
            if '.' in full_model_name:
                app_name, model_name = full_model_name.split('.')
                
                # Get the correct models module
                if app_name == 'bookings':
                    models_module = booking_models
                elif app_name == 'invitations':
                    models_module = invitation_models
                elif app_name == 'core':
                    models_module = core_models
                else:
                    print(f"⚠️  {full_model_name}: Unknown app")
                    continue
                
                model_class = getattr(models_module, model_name)
                
                # Import records
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
            print(f"⚠️  {full_model_name}: Model not found")
        except Exception as e:
            print(f"❌ {full_model_name}: Error - {str(e)[:100]}")
    
    print(f"\n✅ Import complete!")
    print(f"📊 Total records imported: {total_imported}\n")

if __name__ == '__main__':
    import_sample_data()
