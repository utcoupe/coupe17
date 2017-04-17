function [t, Vtarget, d] = predictMovement(Vi, Vm, Acc, dd, HZ)
    
    tend = sqrt(2*Acc*abs(dd))/Acc;
    t = linspace(0, tend, HZ*(tend)+1);
    % Target speed calculation
    Vtarget = calcSpeed(Vi, Vm, Acc, dd, t);
    
    d = zeros(1,1);
    for v=Vtarget
        d = [d (d(end)+v*(1/HZ))];
    end
    d = d(1:end-1);
end

