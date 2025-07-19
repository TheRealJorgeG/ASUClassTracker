#!/usr/bin/env python3
"""
Simple memory-optimized class info scraper for Render deployment
No external dependencies beyond selenium
"""

import sys
import gc
import resource
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def create_optimized_driver():
    """Create memory-optimized Chrome driver"""
    options = Options()
    
    # Essential memory optimizations
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-features=TranslateUI')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-plugins')
    options.add_argument('--disable-images')  # Don't load images to save memory
    options.add_argument('--disable-javascript')  # Only if your target doesn't need JS
    
    # Memory limits
    options.add_argument('--memory-pressure-off')
    options.add_argument('--max_old_space_size=384')  # Limit V8 heap
    
    # Additional optimizations for low memory
    options.add_argument('--disable-background-networking')
    options.add_argument('--disable-background-timer-throttling')
    options.add_argument('--disable-renderer-backgrounding')
    options.add_argument('--disable-backgrounding-occluded-windows')
    options.add_argument('--disable-features=VizDisplayCompositor')
    
    try:
        driver = webdriver.Chrome(options=options)
        driver.implicitly_wait(10)
        return driver
    except Exception as e:
        print(f"Failed to create driver: {e}")
        return None

def cleanup_driver(driver):
    """Clean up driver and force garbage collection"""
    if driver:
        try:
            driver.quit()
        except:
            pass
        driver = None
    
    # Force garbage collection
    gc.collect()

def scrape_class_info(class_id):
    """Scrape class information with memory management"""
    print(f"Starting script for class {class_id}")
    
    # Set memory limit (400MB for free tier)
    try:
        memory_limit = 400 * 1024 * 1024  # 400MB in bytes
        resource.setrlimit(resource.RLIMIT_AS, (memory_limit, memory_limit))
        print("Set memory limit to 400MB")
    except Exception as e:
        print(f"Could not set memory limit: {e}")
    
    driver = None
    
    try:
        print("Initializing Chrome driver")
        driver = create_optimized_driver()
        if not driver:
            return {"error": "Failed to initialize driver"}
        
        # Your actual scraping logic goes here
        # Replace this with your actual URL and scraping code
        url = f"https://your-target-site.com/class/{class_id}"
        
        print(f"Navigating to: {url}")
        driver.get(url)
        
        # Example: Wait for page to load and extract data
        wait = WebDriverWait(driver, 15)
        
        # Replace with your actual selectors and logic
        try:
            # Example selectors - replace with your actual ones
            title_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "class-title")))
            title = title_element.text
            
            # Extract other information as needed
            class_info = {
                "class_id": class_id,
                "title": title,
                # Add other fields as needed
            }
            
            print(f"Successfully scraped class {class_id}")
            return class_info
            
        except Exception as e:
            print(f"Error extracting data: {e}")
            return {"error": f"Failed to extract data: {e}"}
    
    except Exception as e:
        print(f"Error during scraping: {e}")
        return {"error": str(e)}
    
    finally:
        # Always cleanup
        cleanup_driver(driver)

def main():
    if len(sys.argv) != 2:
        print("Usage: python get_class_info.py <class_id>")
        sys.exit(1)
    
    class_id = sys.argv[1]
    
    try:
        result = scrape_class_info(class_id)
        
        if "error" in result:
            print(f"Error: {result['error']}", file=sys.stderr)
            sys.exit(1)
        else:
            # Output the result (modify format as needed)
            import json
            print(json.dumps(result))
    
    except KeyboardInterrupt:
        print("Script interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()