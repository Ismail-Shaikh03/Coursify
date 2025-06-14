import selenium
from selenium import webdriver
from selenium.common import NoSuchElementException, ElementNotInteractableException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time
from selenium.webdriver.chrome.service import Service


import multiprocessing
from selenium import webdriver



def create_course_listings(c_headers, c_tables):
    c_list = []
    #but want to access + 2
    
    for i in range(len(c_headers)):
        
        course_name = c_headers[i].text
#       collect the rows for each section of the course
        t_rows = c_tables[i].find_elements(by=By.CLASS_NAME, value='success')
        w_rows = c_tables[i].find_elements(by=By.CLASS_NAME, value='warning')
    #ignore canceled classes.

        t_rows += w_rows
#       for each row, get all of the cells
        for k in range(len(t_rows)):
            course_row = ["202590"]
            t_cells = t_rows[k].find_elements(by=By.TAG_NAME, value='td')

            split = course_name.split("-")[0].replace(" ","")
            course_row.append(split)

            course_row.append(course_name.split("-")[1].strip())
            for l in range(len(t_cells)):
                course_row.append(t_cells[l].text)
            c_list.append(course_row)
    return c_list



def captureCourse(group):
    start = group[0]
    end = group[1]
    service = Service(executable_path='./chromedriver-linux64/chromedriver')

    driver = webdriver.Chrome(service=service)
    driver.get('https://generalssb-prod.ec.njit.edu/BannerExtensibility/customPage/page/stuRegCrseSched')
    driver.implicitly_wait(0.75)

    start_time = time.perf_counter()
    #account for I change please
    #I HAVE TO SCROLL DOWNNN
    #127
    for i in range(start,end):
        left_link = driver.find_element(By.ID, 'pbid-subjListTableSubjectLink-'+ str(i))
        cs_link = left_link.find_element(by=By.TAG_NAME, value='a')
        if("R" in cs_link.text[0:1]):
            continue
        driver.execute_script("arguments[0].scrollIntoView()", cs_link)
        cs_link.click()
        
        my_span = driver.find_element(by=By.ID, value='pbid-courseListSectionDetailSections-0')
        #print(my_span)
        
        course_headers = my_span.find_elements(by=By.TAG_NAME, value="H4")
        course_tables = my_span.find_elements(by=By.TAG_NAME, value="table")
        # create column headings by using the 'th' cells of the first table
        columns = ["Term","Course","Title","Section","CRN","Days","Times","Location","Status","Max","Now","Instructor","Delivery Mode","Credits","Info","Comments"] 

        # use the list of course_headers and the list of course_tables to build
        #   individual rows - one for each course/section
        course_list = create_course_listings(course_headers, course_tables)
        #print(course_list)
        df = pd.DataFrame(course_list, columns=columns)
        
        #print(df.describe())
        #print(df)
        df.to_csv('courses'+ str(start) +'.csv',mode='a',header=False, index=False)
        #break
    end_time = time.perf_counter()

    driver.quit()
    elapsed_time = end_time - start_time
    print(f"Elapsed time: {elapsed_time:.4f} seconds")



ranges = [[9,30],[30,60],[60,90],[90,120],[120,127]]

#tests = [[0,1],[1,2],[6,7],[7,8],[9,10]]
processes = []
for group in ranges:
    p = multiprocessing.Process(target=captureCourse, args=(group,))
    p.start()
    print("started")
    processes.append(p)

for p in processes:
    p.join()



