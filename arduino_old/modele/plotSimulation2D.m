function [] = plotSimulation2D(init_pos, Vm, Acc, target_pos, HZ, entraxe, inaccuracy_max, delay, max_angle_to_rotate, K_distance_reduction)
    [t, pos, Vl, Vr, Va, Vt] = simulate2D(init_pos, Vm, Acc, target_pos, HZ, entraxe, inaccuracy_max, delay, max_angle_to_rotate, K_distance_reduction );
    figure('Position', [1000, 100, 800, 800]);
    indexes = 1:length(t); 
    subplot(3,2,1);
    hold on;
    plot(t, Vt(indexes)-Va(indexes), 'r');
    plot(t, Vl(indexes));
    legend('Command', 'Response','Location','northwest');
    hold off;
    title('Left wheel speed over time');
    subplot(3,2,2);
    hold on;
    plot(t, Vt(indexes)+Va(indexes), 'r');
    plot(t, Vr(indexes));
    legend('Command', 'Response','Location','northwest');
    hold off;
    title('Right wheel speed over time');
    subplot(3,2,3);
    plot(t, pos(indexes,3));
    title('Orientation over time');
    subplot(3,2,4);
    hold on;
    plot(init_pos(1), init_pos(2), 'or');
    legend('Initial position');
    plot(pos(indexes,1), pos(indexes,2));
    axis(axis);
    axis equal;
    title('Position (trajectory)');
    subplot(3,2,5);
    plot(t, Va(indexes));
    axis(1.1*axis)
    title('Angular speed over time');
    subplot(3,2,6);
    plot(t, Vt(indexes));
    axis(1.1*axis);
    title('Linear speed over time');
end

