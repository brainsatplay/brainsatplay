cmake_minimum_required(VERSION 3.10)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

project(brainsatplay VERSION 0.0.1)                 # create a project with the given name

# LINK LIBRARY SOURCE AND INCLUDE HEADER FILES
add_subdirectory(core)

# LINK LIBRARIES TO MAIN
add_executable("${PROJECT_NAME}" main.cpp)
target_link_libraries("${PROJECT_NAME}" PUBLIC core)

target_include_directories("${PROJECT_NAME}" PRIVATE third_party)