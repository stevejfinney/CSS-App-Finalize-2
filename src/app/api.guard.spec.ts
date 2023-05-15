import { TestBed, async, inject } from '@angular/core/testing';

import { ApiGuard } from './api.guard';

xdescribe('ApiGuard', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ApiGuard]
        });
    });

    it('should ...', inject([ApiGuard], (guard: ApiGuard) => {
        expect(guard).toBeTruthy();
    }));
});