# Nous voulons un cmake "récent" pour utiliser les dernières fonctionnalités
cmake_minimum_required(VERSION 3.0)

# Notre projet est étiqueté hello
project(Test)
set(EXECUTABLE_OUTPUT_PATH bin/${CMAKE_BUILD_TYPE})
set(CMAKE_CXX_STANDARD 11)


include_directories(../lib/include)

link_directories(../lib)

file(GLOB_RECURSE source_files      src/*.cpp )


#Configuration de l'exécutable
add_executable(
        Test
        ${source_files}
)

#target_compile_options(Test PUBLIC "-lpthread ")
#Configuration de l'édition de liens

target_link_libraries(
        Test
        libdxl.a
        "-lpthread"
)
