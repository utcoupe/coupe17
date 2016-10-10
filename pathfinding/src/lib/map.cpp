#include "map.hpp"

using namespace std;

MAP::MAP(const std::string &map_filename):
	image(map_filename) {
	
	map_h = image.height();
	map_w = image.width();

	map = new grid(create_map(map_w, map_h));
	map_barrier = new filtered_grid(create_barrier_map());

	for (int y=0; y < map_h; y++) {
		for (int x=0; x < map_w; x++) {
			unsigned char r, g, b;
			int true_y = map_h - y - 1;
			image.get_pixel(x, y, r, g, b);
			if (b < 127) {
				vertex_descriptor u = get_vertex(x, true_y);
				static_barriers.insert(u);
			}
		}
	}

	barriers = static_barriers;
}

MAP::~MAP() {
	delete map;
	delete map_barrier;
}

void MAP::add_dynamic_circle(int x, int y, float f_r) {
	int r = ceil(f_r);
	int r2 = pow(r, 2);
	for (int p_x=x-r; p_x <= x+r; p_x++) {
		if (p_x < 0 || p_x >= map_w) {
			continue;
		}
		int y_length = ceil(sqrt(r2 - pow(x-p_x,2))); 
		for (int p_y=y-y_length; p_y <= y+y_length; p_y++) {
			if (p_y < 0 || p_y >= map_h) {
				continue;
			}
			vertex_descriptor u = get_vertex(p_x, p_y);
			if (!has_dynamic_barrier(u)) {
				dynamic_barriers.insert(u);
				if (!has_barrier(u)) {
					barriers.insert(u);
				}
			}
		}
	}
	clear_solution();
}

void MAP::clear_dynamic_barriers() {
	dynamic_barriers.clear();
	barriers = static_barriers;
	clear_solution();
}

bool MAP::solve(vertex_descriptor source, vertex_descriptor dest) {
	clear_solution();
	boost::static_property_map<double> weight(1);
	// The predecessor map is a vertex-to-vertex mapping.
	typedef boost::unordered_map<vertex_descriptor,
								vertex_descriptor,
								vertex_hash> pred_map;
	pred_map predecessor;
	boost::associative_property_map<pred_map> pred_pmap(predecessor);
	// The distance map is a vertex-to-distance mapping.
	typedef boost::unordered_map<vertex_descriptor,
							   double,
							   vertex_hash> dist_map;
	dist_map distance;
	boost::associative_property_map<dist_map> dist_pmap(distance);

	v_start = source; 
	v_end = dest;

	astar_goal_visitor visitor(v_end);

	try {
	if (h_mode == NORM1) {
		norm1_heuristic heuristic(v_end);
		astar_search(*map_barrier, v_start, heuristic,
					 boost::weight_map(weight).
					 predecessor_map(pred_pmap).
					 distance_map(dist_pmap).
					 visitor(visitor) );
	} else if (h_mode == EUCLIDEAN) {
		euclidean_heuristic heuristic(v_end);
		astar_search(*map_barrier, v_start, heuristic,
					 boost::weight_map(weight).
					 predecessor_map(pred_pmap).
					 distance_map(dist_pmap).
					 visitor(visitor) );
	}
	} catch(found_goal fg) {
	// Walk backwards from the goal through the predecessor chain adding
	// vertices to the solution path.
	for (vertex_descriptor u = v_end; u != v_start; u = predecessor[u])
		solution.push_back(u);
	solution.push_back(v_start);
	solution_length = distance[v_end];
	return true;
	}
	return false;
}

void MAP::solve_smooth() {
	if (!solved()) return;
	double distance;
	vertex_descriptor last = v_start;
	smooth_solution_length = 0;
	smooth_solution.push_back(v_start);
	// solution.begin is the last vertex in the path
	do {
		for (auto it=solution.begin(); *it!=last; ++it) {
			if (get_direct_distance(last, *it, distance)) {
				smooth_solution.push_back(*it);
				smooth_solution_length += distance;
				last = *it;
				break;
			}
		}
	} while (last != v_end);
}

vertex_descriptor MAP::find_nearest_valid(vertex_descriptor u) {
	int dist = 0;
	vertex_descriptor nearest = u;
	vector<vertex_descriptor> v_this_dist;
	while (has_barrier(nearest)) {
		if (v_this_dist.size() == 0) {
			++dist;
			for (int x=(long)u[0]-dist; x<=(long)u[0]+dist; ++x) {
				if (x < 0 || x > map_w) continue;
				for (int y=(long)u[1]-dist; y<=(long)u[1]+dist; ++y) {
					if (y < 0 || y > map_h) continue;
					vertex_descriptor v = get_vertex(x, y);
					if (norm1_heuristic(u)(v) == dist) {
						v_this_dist.push_back(v);
					}
				}
			}
		}
		nearest = v_this_dist.back();
		v_this_dist.pop_back();
	}
	return nearest;
}

void MAP::generate_bmp(string path) {
	bitmap_image img(map_w, map_h);
	for (int true_y = 0; true_y < map_h; true_y++) {
		for (int x = 0; x < map_w; x++) {
			int y = map_h - true_y - 1;
			vertex_descriptor u = {{(vertices_size_type)x, (vertices_size_type)true_y}};
			if (solution_contains(u))
				img.set_pixel(x, y, 0, 255, 0);
			else if (has_barrier(u))
				img.set_pixel(x, y, 0, 0, 0);
			else
				img.set_pixel(x, y, 255, 255, 255);
		}
	}
	image_drawer draw(img);
	draw.pen_width(3);
	draw.pen_color(50,50,255);
	for (auto &p: smooth_solution) {
		draw.plot_pen_pixel(p[0], map_h - p[1] - 1);
	}
	draw.pen_width(1);
	draw.pen_color(255,0,0);
	for (unsigned int i=1; i<smooth_solution.size(); i++) {
		int x1, x2, y1, y2;
		x1 = smooth_solution[i-1][0];
		x2 = smooth_solution[i][0];
		y1 = map_h - smooth_solution[i-1][1] - 1;
		y2 = map_h - smooth_solution[i][1] - 1;
		draw.line_segment(x1, y1, x2, y2);
	}
	img.save_image(path);
}

/* 			*
 *  PRIVATE *
 * 			*/

bool MAP::get_direct_distance(vertex_descriptor& v, vertex_descriptor& goal, double &d) {
	double m, c;
	long dx, dy;
	int inc;
	dx = (long)goal[0] - (long)v[0];
	dy = (long)goal[1] - (long)v[1];
	if (abs(dx) > abs(dy)) {
		// iterate over X
		if (dx > 0) {
			inc = 1;
		} else {
			inc = -1;
		}
		m = (double)dy / dx;
		c = v[1] - m*v[0];
		for (int x=v[0]; x!=(long)goal[0]; x+=inc) {
			int y = round(m*x+c);
			if (has_barrier(get_vertex(x, y))) {
				d = 0;
				return false;
			}
		}
	} else {
		// iterate over Y
		if (dy > 0) {
			inc = 1;
		} else {
			inc = -1;
		}
		m = (double)dx / dy;
		c = v[0] - m*v[1];
		for (int y=v[1]; y!=(long)goal[1]; y+=inc) {
			int x = round(m*y+c);
			if (has_barrier(get_vertex(x, y))) {
				d = 0;
				return false;
			}
		}
	}
	d = euclidean_heuristic(goal)(v);
	return true;
}

vertex_descriptor MAP::get_vertex(int x, int y) {
	return vertex(x+(y*map_w), *map);
}

grid MAP::create_map(std::size_t x, std::size_t y) {
	boost::array<std::size_t, 2> lengths = { {x, y} };
	return grid(lengths);
}

filtered_grid MAP::create_barrier_map() {
	return boost::make_vertex_subset_complement_filter(*map, barriers);
}

#define BARRIER "#"
// Print the maze as an ASCII map.
std::ostream& operator<<(std::ostream& output, const MAP& m) {
	output << "Grid size : " << m.get_map_w() << "x" <<  m.get_map_h() << std::endl;
	// Header
	for (int i = 0; i < m.get_map_w()+2; i++)
		output << BARRIER;
	output << std::endl;
	// Body
	for (int y = 0; y < m.get_map_h(); y++) {
		for (int x = 0; x < m.get_map_w(); x++) {
			// Put a barrier on the left-hand side.
			if (x == 0)
				output << BARRIER;
			// Put the character representing this point in the maze grid.
			vertex_descriptor u = {{(vertices_size_type)x, (vertices_size_type)y}};
			if (m.smooth_solution_contains(u))
				output << "O";
			else if (m.solution_contains(u))
				output << ".";
			else if (m.has_barrier(u))
				output << BARRIER;
			else
				output << " ";
			// Put a barrier on the right-hand side.
			if (x == m.get_map_w()-1)
				output << BARRIER;
		}
		// Put a newline after every row except the last one.
		output << std::endl;
	}
	// Footer
	for (int i = -1; i < m.get_map_w()+2; i++)
		output << BARRIER;
	return output;
}
