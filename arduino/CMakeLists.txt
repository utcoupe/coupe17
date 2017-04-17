cmake_minimum_required(VERSION 2.8)

set(CMAKE_TOOLCHAIN_FILE /home/tfuhrman/dev/tools/arduino-cmake/cmake/ArduinoToolchain.cmake) # Arduino Toolchain

# target are : arduino_r_t with r = pr/gr and t = asserv/others
project(arduino C CXX)

# TODO automatic depending on user choice and program to generate
set(ARDUINO_DEFAULT_BOARD mega2560)
set(ARDUINO_DEFAULT_PORT /dev/ttyACM0)

set(TARGET_ROBOT gr)
set(TARGET_PROGRAM asserv)

file(GLOB_RECURSE SRC_FILES	${TARGET_ROBOT}/${TARGET_PROGRAM}/*.cpp common/${TARGET_PROGRAM}/*.c common/${TARGET_PROGRAM}/*.cpp)
#file(GLOB_RECURSE HDR_FILES	${TARGET_ROBOT}/${TARGET_PROGRAM}/*.h common/${TARGET_PROGRAM}/*.h)

include_directories(${TARGET_ROBOT}/${TARGET_PROGRAM} common/${TARGET_PROGRAM})

generate_arduino_firmware(${PROJECT_NAME}_${TARGET_ROBOT}_${TARGET_PROGRAM}
    SRCS ${SRC_FILES}
#    HDRS ${HDR_FILES}
#	LIBS HardwareSerial
    PORT ${ARDUINO_DEFAULT_PORT}
    BOARD ${ARDUINO_DEFAULT_BOARD}
)

