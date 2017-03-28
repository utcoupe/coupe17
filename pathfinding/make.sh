DIR=build
mkdir -p $DIR
cd build
#rm -f CMakeCache.txt
#rm -rf CMakeFiles
cmake  ../ -DCMAKE_BUILD_TYPE=Release
make -j4

