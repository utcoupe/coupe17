#include <iostream>
#include <vector>

#include <tclap/CmdLine.h>

#include "lib/map.hpp"

#define FAILED_STR "FAIL\n"

using namespace std;
using namespace TCLAP;

// Declaration of command line options
bool debugFlag = false;
bool bmpRenderingFlag = false;
string mapPath = "";
heuristic_type heuristicMode = NORM1;

/**
 * Parse the command line options and sets the corresponding global variables.
 * @param argc The number of command line arguments
 * @param argv The array of command line arguments
 */
void parseOptions(int argc, char** argv);


/*
 * Communication protocol between the IA and the pathfinding
 * cmd;x1;y1;x2;y2;....
 * Cmd =
 *  C : compute a path (args are x_start:y_start;x_end;y_end)
 *  D : refresh the internal dynamic objects (x;y;radius)
 * The pathfinding answers a computing command with the valid path found,
 * with respect of the format : x_start;y_start;x1;y1;...;x_end;y_end;path_length
 */

// correspond to a moving robot, we know its position (x,y) and its radius (r)
typedef struct dynamic_object {
    int x, y, r;
} dynamic_object;

// check if we are in the map
inline bool is_valid(int x, int y, MAP &map) {
    return x >= 0 && x < map.get_map_w() && y >= 0 && y < map.get_map_h();
}

// remove the dynamic objects in the MAP and add the one given by command
void command_add_dynamic(string& command, MAP &map) {
    vector<dynamic_object> objs;
    command = command.substr(2);
    if (debugFlag) {
        cout << "Objects this time :" << endl;
    }
    while (command.find(';') != string::npos) {
        dynamic_object obj;
        sscanf(command.c_str(), "%i;%i;%i", &obj.x, &obj.y, &obj.r);
        objs.push_back(obj);
        command = command.substr(command.find(';')+1);
        command = command.substr(command.find(';')+1);
        command = command.substr(command.find(';')+1);
        if (debugFlag) {
            cout << obj.x << ":" << obj.y << ":" << obj.r << endl;
        }
    }
    map.clear_dynamic_barriers();
    for (auto &obj: objs) {
        map.add_dynamic_circle(obj.x, obj.y, obj.r);
    }
}

/*
 * INPUT : 	
 * 		command : x_start;y_start;x_end;y_end\n
 *
 * OUTPUT: 	
 * 		if valid:
 * 	 		x_start;y_start;x1;y1;...;xn;xy;x_end;y_end;path_length\n
 * 			all coordinates are integers, path_length is a float 		
 * 		if invalid (no path found or parsing error):
 * 			FAILED\n
 *
 * if start point is not valid, find the nearest valid point
 * if end point is not valid, do the same, except if
 * 		the end point is in a dynamic barrier (aka a robot)
 * 		then return \n immediatly
 */
string command_calc_path(string& command, MAP &map) {
    int x_s, y_s, x_e, y_e;
    vertex_descriptor start, end, start_valid, end_valid;
    vector<vertex_descriptor> path;
    double distance;
    stringstream answer;

    // Get the initial and end point and search the nearest valid point

    command = command.substr(2);
    if (sscanf(command.c_str(), "%i;%i;%i;%i", &x_s, &y_s, &x_e, &y_e) < 4) {
        cerr << "Did not parse the input correctly" << endl;
        return FAILED_STR;
    }
    if (!(is_valid(x_s, y_s, map) && is_valid(x_e, y_e, map))) {
        cerr << "Start or end point is not in the map" << endl;
        return FAILED_STR;
    }

    end = map.get_vertex(x_e, y_e);
    if (map.has_dynamic_barrier(end)) {
        cerr << "End point on a dynamic object" << endl;
        return FAILED_STR;
    }
    end_valid = map.find_nearest_valid(end);

    start = map.get_vertex(x_s, y_s);
    start_valid = map.find_nearest_valid(start);

    if (debugFlag) {
        cout << "Start : " << start_valid[0] << ":" << start_valid[1] << endl;
        cout << "End : " << end_valid[0] << ":" << end_valid[1] << endl;
        clock_t t = clock();
    }

    // Ask the map to compute the path between the start and the end

    map.solve(start_valid, end_valid);
    if (!map.solved()) {
        cerr << "Could not find any path" << endl;
        return FAILED_STR;
    }
    // Transform the path to be smoother
    map.solve_smooth();
    // Get the result path
    path = map.get_smooth_solution();
    distance = map.get_smooth_solution_length();
    // Check if the path is valid
    if (start != start_valid) {
        path.insert(path.begin(), start);
        distance += euclidean_heuristic(start)(start_valid);
    }
    if (end != end_valid) {
        path.push_back(end);
        distance += euclidean_heuristic(end)(end_valid);
    }
    // Create the string representing the path
    for (auto &point: path) {
        answer << point[0] << ";" << point[1] << ";";
    }
    answer << distance << endl;
    if (debugFlag) {
        cout << "Path contains " << path.size() << " points, total distance = " << distance << endl;
        cout << "Computing time : " << double(clock() - t)/CLOCKS_PER_SEC << endl;
        if (bmpRenderingFlag) {
            map.generate_bmp("tmp.bmp");
        }
    }
    return answer.str();
}

int main(int argc, char **argv) {
    // Parse the command line options
    parseOptions(argc,argv);

    if (debugFlag) {
        cout << "Loading map " << mapPath << endl;
        switch (heuristicMode) {
            case EUCLIDEAN:
                cout << "Using euclidean heuristic" << endl;
                break;
            case NORM1:
                cout << "Using norm1 heuristic" << endl;
                break;
        }
    }
    MAP map(mapPath);
    map.set_heuristic_mode(heuristicMode);
    if (debugFlag) {
        cout << "Done, map size is : " << map.get_map_w()
             << "x" << map.get_map_h() << endl;
    }
    while (std::cin.good()) {
        string command, answer;
        cin >> command;
        switch (command[0]) {
            case 'D':
                command_add_dynamic(command, map);
                break;
            case 'C':
                answer = command_calc_path(command, map);
                cout << answer;
                cout.flush();
                break;
            default:
                cerr << "Default : " << command[0] << endl;
                break;
        }
    }
    cout << "Communication with system failed, stop the pathfinding" << endl;
}

void parseOptions(int argc, char** argv) {
    try {
        CmdLine cmd("Command description message", ' ', "0.1");

        ValueArg<string> mapArg("m","map","Path to the map used to compute pathfinding.",true,"","string");
        cmd.add(mapArg);

        ValueArg<uint8_t> heuristicArg("h","heuristic","Heuristic mode for pathfinding computing (EUCLIDIEAN = 0, NORM1 = 1).",false,1,"uint8_t");
        cmd.add(heuristicArg);

        ValueArg<bool> debugArg("d","debug","Set the debug flag.",false,false,"bool");
        cmd.add(debugArg);

        ValueArg<bool> renderingArg("r","rendering","Set the rendering flag.",false,false,"bool");
        cmd.add(renderingArg);

        cmd.parse(argc, argv);

        mapPath = mapArg.getValue();
        heuristicMode = (heuristic_type)heuristicArg.getValue();
        debugFlag = debugArg.getValue();
        bmpRenderingFlag = renderingArg.getValue();
    } catch (ArgException &e) { // catch any exceptions
        cerr << "error: " << e.error() << " for arg " << e.argId() << endl;
    }
}
