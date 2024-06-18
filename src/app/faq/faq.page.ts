import {
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, EventType, Router } from '@angular/router';
import { filter } from 'rxjs';
import type { ICardFAQ } from '../../../interfaces';
import { tryNavigateToHash } from '../_shared/helpers';
import { FAQService } from '../faq.service';
import { MetaService } from '../meta.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private faqService = inject(FAQService);
  public metaService = inject(MetaService);

  private locale = signal<string>('');
  public productId = signal<string>('');

  public faqs = computed(() => this.faqService.getFAQs());
  public currentFAQ = computed(() =>
    this.faqService.getProductFAQ(this.productId(), this.locale())
  );
  public faqProductName = computed(() =>
    this.metaService.getProductNameByProductId(this.productId())
  );

  constructor() {
    this.router.events
      .pipe(takeUntilDestroyed())
      .pipe(filter((evt) => evt.type === EventType.NavigationEnd))
      .subscribe(() => this.parseQueryParams());
  }

  ngOnInit() {
    tryNavigateToHash();
  }

  ionViewDidEnter() {
    this.parseQueryParams();

    if (!this.locale() || !this.productId()) {
      this.router.navigate(['/faq']);
      return;
    }
  }

  loadFAQ(faq: { productId: string; locale: string; faq: ICardFAQ[] }) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { locale: faq.locale, productId: faq.productId },
      queryParamsHandling: 'merge',
    });

    this.locale.set(faq.locale);
    this.productId.set(faq.productId);

    this.parseQueryParams();
  }

  private parseQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);

    this.locale.set(urlParams.get('locale') ?? '');
    this.productId.set(urlParams.get('productId') ?? '');
  }
}
