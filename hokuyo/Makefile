DEBUG=yes
SDL=no

CC=gcc
SRC_FILES=main.c fast_math.c analyzer.c exceptions.c frame.c
SRC_DIR=src/
EXEC=bin/hokuyo

LFLAGS=-Wall `urg_c-config --libs` -lm
CFLAGS=-Wall `urg_c-config --cflags`

ifeq ($(DEBUG),yes)
	CFLAGS += -D DEBUG
else
	CFLAGS += -Werror
	LFLAGS += -Werror
endif

ifeq ($(SDL),yes)
	SRC_FILES+= sdl.c
	LFLAGS+= `sdl-config --libs` 
	CFLAGS+= -D SDL `sdl-config --cflags` 
	EXEC=bin/hokuyo_sdl
endif

SOURCES=$(SRC_FILES:%=$(SRC_DIR)%)
OBJS=$(SOURCES:src/%.c=build/%.o)

all: $(EXEC)

$(EXEC): $(OBJS)
	$(CC) -o $@ $^ $(LFLAGS)

build/%.o: src/%.c build
	$(CC) -o $@ $(CFLAGS) -c $<

build:
	mkdir build

sdl.o: sdl.h global.h
main.o: fast_math.h global.h analyzer.h
analyser.o: fast_math.h global.h analyzer.h
fast_math.o: fast_math.h global.h
clean:
	rm -rf build
mrproper: clean
	rm $(EXEC)

.PHONY: clean
