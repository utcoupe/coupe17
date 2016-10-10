TARGET		= libdxl.a
LIBNAME		= libusb2ax.so
OBJS		= dxl_hal.o dynamixel.o
SRCS		= $(OBJS:.o=.c)
INCLUDEDIRS	+= -I../include
LIBDIRS		+= 
CFLAGS		= $(INCLUDEDIRS) -W -Wall -O2 -fPIC

CC			= gcc
AR			= ar

$(TARGET): $(OBJS)
	$(AR) rs $@ $^
	cp $(TARGET) ../lib
	
.c.o:
	$(CC) -c $< $(CFLAGS)
	
clean:
	rm -f $(OBJS) $(TARGET) $(OBJS)
	@echo "file deleted."

lib:
	gcc -fPIC -shared $(OBJS) -o $(LIBNAME)
	cp $(LIBNAME) ../lib
	
dep:
	gccmakedep $(SRCS)
