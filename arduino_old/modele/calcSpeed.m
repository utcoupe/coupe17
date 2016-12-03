function [ Vtarget ] = calcSpeed(Vi, Vm, Acc, dd, t)
    Dsign = sign(dd);
    dd = abs(dd);
    Vi = Vi*Dsign;
    
    Vacc = t*Acc + Vi;
    Vdec = -t*Acc + sqrt(2*Acc*dd);
    Vmax = Vm*ones(1,length(t));
    Vtarget = min(vertcat(Vacc, Vmax, Vdec));
    Vtarget = Vtarget*Dsign;
end

