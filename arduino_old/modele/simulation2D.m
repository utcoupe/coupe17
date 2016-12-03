Vm = 1;     % m/s
Acc = 1;  % m/s2
dd = 5;    % m
HZ = 100;
K_distance_reduction = 10; % the higher the mor the robot will rotate before going to its destination
max_angle_to_rotate = 3*pi/4; % above that angle, the robot will go backwards
delay = 5/HZ; % control rise time

inital_pos = [0, 0, 0];
target_pos = [-1, 2];

entraxe = 0.1; %m
encoder_radius = 30; % mm
ticks_per_turn = 1024;

max_inaccuracy = (HZ * (2*pi*encoder_radius) / ticks_per_turn) / 1000; % intrinsic

plotSimulation2D(inital_pos, Vm, Acc, target_pos, HZ, entraxe, max_inaccuracy, delay, max_angle_to_rotate, K_distance_reduction );