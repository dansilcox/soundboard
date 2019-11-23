import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundboardDisplayComponent } from './soundboard-display.component';

describe('SoundboardDisplayComponent', () => {
  let component: SoundboardDisplayComponent;
  let fixture: ComponentFixture<SoundboardDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoundboardDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundboardDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
