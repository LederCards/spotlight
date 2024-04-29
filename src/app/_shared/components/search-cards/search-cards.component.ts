/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, output } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../../search.service';

@Component({
  selector: 'app-search-cards',
  templateUrl: './search-cards.component.html',
  styleUrls: ['./search-cards.component.scss'],
})
export class SearchCardsComponent {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);

  public pageChanged = output<number>();

  public queryDesc = '';

  changePage(newPage: number) {
    this.searchService.changePage(newPage);
    this.pageChanged.emit(newPage);
  }

  public getDetailHeight(): any {
    return '100%';
  }
}
