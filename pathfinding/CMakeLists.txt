#Configuration du projet
cmake_minimum_required(VERSION 2.8)
project(pathfinding)

FIND_PACKAGE(Boost REQUIRED)
SET(CMAKE_CXX_FLAGS "-std=c++11 -Wall -Werror")

set(EXECUTABLE_OUTPUT_PATH bin/)
set(EXEC_NAME pathfinding)
set(TEST_MAP_EXEC_NAME test_map)

file(
	GLOB_RECURSE
	lib_files
	src/lib/*
)

file(
	GLOB_RECURSE
	executable_file
	src/main.cpp
)

file(
	GLOB_RECURSE
	test_map
	src/test/map_test.cpp
)

add_executable(
	${EXEC_NAME}
	${lib_files}
 	${executable_file}
)

add_executable(
	${TEST_MAP_EXEC_NAME}
	${lib_files}
	${test_map}
)
