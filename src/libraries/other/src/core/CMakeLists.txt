add_library(core STATIC minimal-ws-client-echo.c Brainsatplay.cpp)
target_include_directories(core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_include_directories(core PRIVATE ../third_party)
 