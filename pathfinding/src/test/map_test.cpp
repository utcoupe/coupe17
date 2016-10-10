#include <iostream>
#include <time.h>

#include "../lib/map.hpp"

int main() {
	std::string path;
	std::cout << "Path to bmp :" << std::endl;
	std::cin >> path;
	MAP map(path);
	std::cout << "Map is " << map.get_map_w() << "x" << map.get_map_h() << std::endl;
	std::cout << "Select source and destination" << std::endl;
	clock_t teu, tn1, t = clock();
	int x_s, y_s, x_e, y_e;
	std::cin >> x_s;
	std::cin >> y_s;
	std::cin >> x_e;
	std::cin >> y_e;

	// EUCLIDEAN
	map.set_heuristic_mode(EUCLIDEAN);
	map.solve(x_s,y_s,x_e,y_e);
	map.solve_smooth();
	teu = clock() - t;

	std::cout << std::endl << "EUCLIDEAN" << std::endl;
	std::cout << "Smooth solution length : " << map.get_smooth_solution_length() << std::endl;
	printf ("Time : %f seconds.\n",((float)teu)/CLOCKS_PER_SEC);
	map.generate_bmp(path+"-euclidean.bmp");
	if (map.get_map_w() < 80 && map.get_map_h() < 50) 
		std::cout << map << std::endl;

	// NORM1
	t = clock();
	map.set_heuristic_mode(NORM1);
	map.solve(x_s,y_s,x_e,y_e);
	map.solve_smooth();
	tn1 = clock() - t;

	std::cout << std::endl << "NORM1" << std::endl;
	std::cout << "Smooth solution length : " << map.get_smooth_solution_length() << std::endl;
	printf ("Time : %f seconds.\n",((float)tn1)/CLOCKS_PER_SEC);
	map.generate_bmp(path+"-norm1.bmp");
	if (map.get_map_w() < 80 && map.get_map_h() < 50) 
		std::cout << map << std::endl;

	return 0;
}
