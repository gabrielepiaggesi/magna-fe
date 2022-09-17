import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-business-social-posts',
  templateUrl: './business-social-posts.component.html',
  styleUrls: ['./business-social-posts.component.scss']
})
export class BusinessSocialPostsComponent implements OnInit {
  public loading = false;
  public businessId!: number;
  public socialPosts$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public currentSocialPost$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  constructor(
    private apiService: ApiService, 
    protected _sanitizer: DomSanitizer, 
    private activateRouter: ActivatedRoute, 
    public router: Router) {
      this.activateRouter.params.subscribe(
        (params) => {
          this.businessId = +params['businessId'];
        }
      );
    }

  ngOnInit(): void { 
    this.businessId && this.getSocialPosts();
  }

  public getSocialPosts() {
    this.loading = true;
    this.apiService
      .getBusinessSocialPosts(this.businessId)
      .then((socialPosts: any) => {
        const socialPostsParsed = socialPosts.map((post: any, idx: number) => {
          const url = post.url.includes('?') ? post.url.replace('?', 'embed?') : 
            post.url + (post.url.endsWith('/') ? '' : '/') + 'embed?utm_source=ig_web_copy_link';
          return { ...post, url: this._sanitizer.bypassSecurityTrustResourceUrl(url), idx };
        });
        this.socialPosts$.next(socialPostsParsed);
        socialPostsParsed && socialPostsParsed.length && this.currentSocialPost$.next(socialPostsParsed[0]);
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public approve() {
    const socialPosts = this.socialPosts$.getValue();
    const currentSocialPost = this.currentSocialPost$.getValue();
    this.loading = true;
    this.apiService
      .approveSocialPost(currentSocialPost.id)
      .then((res: any) => console.debug(res))
      .catch((e: any) => console.error(e))
      .finally(() => {
        const currentIdx = currentSocialPost?.idx;
        if (currentIdx >=0 && socialPosts.length > currentIdx+1) {
          this.currentSocialPost$.next(socialPosts[currentIdx+1]);
        } else {
          this.socialPosts$.next([]);
          this.currentSocialPost$.next(undefined);
        }
        this.loading = false;
      });
  }

  public discard() {
    const socialPosts = this.socialPosts$.getValue();
    const currentSocialPost = this.currentSocialPost$.getValue();
    this.loading = true;
    this.apiService
      .discardSocialPost(currentSocialPost.id)
      .then((res: any) => console.debug(res))
      .catch((e: any) => console.error(e))
      .finally(() => {
        const currentIdx = currentSocialPost?.idx;
        if (currentIdx >=0 && socialPosts.length > currentIdx+1) {
          this.currentSocialPost$.next(socialPosts[currentIdx+1]);
        } else {
          this.socialPosts$.next([]);
          this.currentSocialPost$.next(undefined);
        }
        this.loading = false;
      });
  }
}
