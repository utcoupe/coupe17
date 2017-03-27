----------------------------------------------------------------------
-- About URG Library (C/C++)
----------------------------------------------------------------------

About
----------------------------------------
This is the library for the Hokuyo URG Sensor series (Classic-URG, Rapid-URG, Hi-URG, Top-URG)

License
----------------------------------------
- LGPL


Compiling and Running
----------------------------------------
- Windows (Visual Studio 2005)
    - Decompress the package folder and select "urg-X.X.X/samples/c/*/*.vcproj", where "X.X.X" corresponds to the library's current version number.
    - After project opens in Visual Studio, make sure to select the build type "Release" (in "Debug" mode the library may become slow.)
    - Press Build button and Run.
    - If the COM port is not detected, change the "device" variable inside main.

- Linux, Mac
    - Decompress the package and then build it using the conventional commands:  ./configure & make

- Required C++ Libraries: SDL(>=1.2.10), SDL_net.

Contact
----------------------------------------
URG Helper Mailing List <urgwidget-users@lists.sourceforge.net>
