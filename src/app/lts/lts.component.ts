import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lts',
  templateUrl: './lts.component.html',
  styleUrls: ['./lts.component.css']
})
export class LtsComponent implements OnInit {

    title = '';
  
    constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    let judgeid = this.activatedRoute.snapshot.params.judgeid;
    
    this.title = judgeid;
    
  }

}
