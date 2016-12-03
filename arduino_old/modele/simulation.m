%% SIMULATION %%
% inaccuraccy is max difference between V and Vtarget at any time (m/s)

Vi = 0;   % m/s
Vm = 1;     % m/s
Acc = 0.4;  % m/s2
dd = 5;    % m
HZ = 100;

encoder_radius = 30; % mm
ticks_per_turn = 1024;

max_inaccuracy = (HZ * (2*pi*encoder_radius) / ticks_per_turn) / 1000

figure;
plotSimulation(Vi, Vm, Acc, dd, HZ, max_inaccuracy, 'r');
plotSimulation(Vi, Vm, Acc, dd, HZ, 0, 'g');
drawnow;

figure;
plotSimulation(Vi, Vm, Acc, dd, HZ, 0.01, 'r');
plotSimulation(Vi, Vm, Acc, dd, HZ, 0.005, 'b');
plotSimulation(Vi, Vm, Acc, dd, HZ, 0, 'g');
drawnow;

Vi = 0.3;   % m/s
dd = -0.5;    % m

figure;
plotSimulation(Vi, Vm, Acc, dd, HZ, 0.01, 'r');
plotSimulation(Vi, Vm, Acc, dd, HZ, 0.005, 'b');
plotSimulation(Vi, Vm, Acc, dd, HZ, 0, 'g');
drawnow;