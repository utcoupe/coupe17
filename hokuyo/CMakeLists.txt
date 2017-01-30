#Configuration du projet
cmake_minimum_required(VERSION 2.8)
project(hokuyo_client)

FIND_PACKAGE(SDL REQUIRED)
SET(CMAKE_C_FLAGS "-std=gnu99 -Wall -Werror")

set(EXECUTABLE_OUTPUT_PATH bin/)
set(EXEC_NAME hokuyo)

#Configurationdel'exécutable

file(
	GLOB_RECURSE
	source_files
	src/*
)

add_executable(
	${EXEC_NAME}
	${source_files}
)


INCLUDE_DIRECTORIES( ${SDL_INCLUDE_DIR} )
include_directories( /usr/local/include/c_urg )
target_link_libraries( hokuyo
	#libjansson
	c_urg 
	c_urg_connection 
	c_urg_system 
	SDL 
	m )
