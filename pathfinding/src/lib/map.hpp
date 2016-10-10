#ifndef MAP_H
#define MAP_H

#include <iostream>
#include <vector>

#include <boost/graph/astar_search.hpp>
#include <boost/graph/grid_graph.hpp>
#include <boost/graph/filtered_graph.hpp>
#include <boost/lexical_cast.hpp>
#include <boost/unordered_map.hpp>
#include <boost/unordered_set.hpp>

#include "bitmap_image.hpp"

typedef boost::grid_graph<2> grid;
typedef boost::graph_traits<grid>::vertex_descriptor vertex_descriptor;
typedef boost::graph_traits<grid>::vertices_size_type vertices_size_type;

struct vertex_hash:std::unary_function<vertex_descriptor, std::size_t> {
	std::size_t operator()(vertex_descriptor const& u) const {
		std::size_t seed = 0;
		boost::hash_combine(seed, u[0]);
		boost::hash_combine(seed, u[1]);
		return seed;
	}
};

typedef boost::unordered_set<vertex_descriptor, vertex_hash> vertex_set;
typedef boost::vertex_subset_complement_filter<grid, vertex_set>::type
        filtered_grid;

typedef enum heuristic_type { EUCLIDEAN, NORM1 } heuristic_type;

class MAP {
	public:
		MAP(const std::string &map_filename);
		~MAP();
		int get_map_h() const { return map_h; };
		int get_map_w() const { return map_w; };
		void add_dynamic_circle(int x, int y, float f_r);
		void clear_dynamic_barriers();

		bool solve(vertex_descriptor source, vertex_descriptor dest);
		bool solve(int x_source, int y_source,
					int x_dest, int y_dest) {
			return solve(get_vertex(x_source, y_source), 
							get_vertex(x_dest, y_dest));
		}
		void solve_smooth();

		bool solution_contains(vertex_descriptor u) const {
			for (const auto &el: solution) {
				if (el == u)
					return true;
			}
			return false;
		}
		bool smooth_solution_contains(vertex_descriptor u) const {
			for (const auto &el: smooth_solution) {
				if (el == u)
					return true;
			}
			return false;
		}
		bool has_barrier(vertex_descriptor u) const {
			return 	(barriers.find(u) != barriers.end());
		}
		
		bool has_dynamic_barrier(vertex_descriptor u) const {
			return 	(dynamic_barriers.find(u) != dynamic_barriers.end());
		}

		void generate_bmp(std::string path);
		vertex_descriptor find_nearest_valid(vertex_descriptor u);
		vertex_descriptor find_nearest_valid(int x, int y) {
			return find_nearest_valid(get_vertex(x, y));
		};

		vertex_descriptor get_vertex(int x, int y);
		double get_smooth_solution_length() { return smooth_solution_length; };
		double get_solution_length() { return smooth_solution_length; };
		std::vector<vertex_descriptor> get_solution() { return solution; };
		std::vector<vertex_descriptor> get_smooth_solution() { return smooth_solution; };
		bool solved() const {return !solution.empty();}
		void set_heuristic_mode(heuristic_type mode) { h_mode = mode; };
	private:
		int map_w, map_h;
		grid create_map(std::size_t x, std::size_t y);
		filtered_grid create_barrier_map();
		bool get_direct_distance(vertex_descriptor& v, vertex_descriptor& goal, 
									double &d);
		void clear_solution() {
			solution.clear();
			solution_length = 0;
			smooth_solution.clear();
		}

		bitmap_image image;
		grid *map;
		filtered_grid *map_barrier;
		vertex_set barriers, static_barriers, dynamic_barriers;
		std::vector<vertex_descriptor> solution, smooth_solution;
		vertex_descriptor v_start, v_end;
		heuristic_type h_mode;
		double solution_length, smooth_solution_length;
};

std::ostream& operator<<(std::ostream& os, const MAP& map);

struct found_goal {};

class euclidean_heuristic: public boost::astar_heuristic<filtered_grid, double> {
	public:
	euclidean_heuristic(vertex_descriptor goal):m_goal(goal) {};
	double operator()(vertex_descriptor v) {
		return sqrt(pow(double(m_goal[0]) - double(v[0]), 2) + pow(double(m_goal[1]) - double(v[1]), 2));
	}

	private:
	vertex_descriptor m_goal;
};

class norm1_heuristic: public boost::astar_heuristic<filtered_grid, double> {
	public:
	norm1_heuristic(vertex_descriptor goal):m_goal(goal) {};
	double operator()(vertex_descriptor v) {
		return abs(m_goal[0] - v[0]) + abs(m_goal[1] - v[1]);
	}

	private:
	vertex_descriptor m_goal;
};

struct astar_goal_visitor: public boost::default_astar_visitor {
	astar_goal_visitor(vertex_descriptor goal):m_goal(goal) {};
	void examine_vertex(vertex_descriptor u, const filtered_grid&) {
		if (u == m_goal)
			throw found_goal();
	}

	private:
	vertex_descriptor m_goal;
};

#endif
