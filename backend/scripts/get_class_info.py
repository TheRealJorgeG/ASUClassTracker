from bs4 import BeautifulSoup
from selenium import webdriver
import time
import sys
import json

def getClassInfo(classNumber):
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--log-level=3')
    chrome_options.add_argument('--headless')  # headless mode
    driver = webdriver.Chrome(options=chrome_options)

    url = f"https://catalog.apps.asu.edu/catalog/classes/classlist?campusOrOnlineSelection=A&honors=F&keywords={classNumber}&promod=F&searchType=all&term=2257"
    driver.get(url)
    time.sleep(1)

    html_content = driver.page_source
    soup = BeautifulSoup(html_content, 'html.parser')

    # Course and title
    boldElements = soup.select('.pointer .bold-hyperlink')
    course = boldElements[0].get_text(strip=True) if len(boldElements) > 0 else "N/A"
    title = boldElements[1].get_text(strip=True) if len(boldElements) > 1 else "N/A"

    # Instructors
    instructorDivs = soup.find_all("div", class_="class-results-cell instructor")
    instructors = []
    for div in instructorDivs:
        aTag = div.find("a", class_="link-color")
        if aTag:
            instructors.append(aTag.get_text(strip=True))
        else:
            instructors.append(div.get_text(strip=True))

    # Extract Days
    daysElement = soup.select_one('.class-results-cell.pull-left.days p')
    days = daysElement.get_text(strip=True) if daysElement else "N/A"

    # Extract Start Time
    startTimeElement = soup.select_one('.class-results-cell.pull-left.start p')
    start_time = startTimeElement.get_text(strip=True) if startTimeElement else "N/A"

    # Extract End Time
    endTimeElement = soup.select_one('.class-results-cell.end p')
    end_time = endTimeElement.get_text(strip=True) if endTimeElement else "N/A"

    # Combine start and end times
    if start_time != "N/A" and end_time != "N/A":
        combined_time = f"{start_time} - {end_time}"
    else:
        combined_time = "N/A"

    # Extract Location
    locationElement = soup.select_one('.class-results-cell.location p')
    location = locationElement.get_text(strip=True) if locationElement else "N/A"

    # Extract Dates
    datesElement = soup.select_one('.class-results-cell.d-none.d-lg-block.dates p')
    dates = datesElement.get_text(strip=True) if datesElement else "N/A"

    # Extract Units (directly in div)
    unitsElement = soup.select_one('.class-results-cell.d-none.d-lg-block.units')
    units = unitsElement.get_text(strip=True) if unitsElement else "N/A"

    # Open/closed seats
    seatElements = soup.select('.seats .text-nowrap')
    seatCounts = [seat.get_text() for seat in seatElements]
    seat_status = "Closed"
    for seat in seatCounts:
        if seat and int(seat[0]) > 0:
            seat_status = "Open"
            break

    driver.quit()

    if not seatCounts:
        return None

    return {
        "course": course,
        "title": title,
        "number": classNumber,
        "instructors": instructors,
        "days": days,
        "time": combined_time,  # Combined time field
        "location": location,
        "dates": dates,
        "units": units,
        "seatStatus": seat_status,
        # Keep individual times for backward compatibility if needed
        "startTime": start_time,
        "endTime": end_time,
    }

if __name__ == "__main__":
    input_class_number = sys.argv[1]
    class_info = getClassInfo(input_class_number)
    if class_info:
        print(json.dumps(class_info))  # output as JSON
    else:
        print(json.dumps({"error": "Class not found"}))

sys.stdout.flush()