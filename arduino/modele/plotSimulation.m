function [] = plotSimulation(Vi, Vm, Acc, dd, HZ, inaccuracy_max, color)
    [t, V, d] = simulate(Vi, Vm, Acc, dd, HZ, inaccuracy_max);
    subplot(1,2,1);
    hold on;
    xlabel('Time (s)');
    ylabel('Speed (m/s)');
    plot(t, V, 'Color', color, 'LineWidth', 2);

    subplot(1,2,2);
    xlabel('Time (s)');
    ylabel('Position (m)');
    hold on;
    plot(t, d(1) - d, 'Color', color, 'LineWidth', 2 );
    line([t(1), t(end)], [d(1), d(1)], 'Color', 'b', 'LineStyle', '--');
end

