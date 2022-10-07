import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';

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
    window.onload = () => {
      var iframe = (document?.getElementById("frameSocial") as HTMLIFrameElement)?.contentWindow?.focus();
    };
    this.businessId && this.getSocialPosts();
  }

  public getUrl(url: string) {
    console.log('OLD URL', url);
    const newUrl = url && url.includes('embed') ? (`${url}`).replace('embed', '') :`${url}`;
    console.log('NEW URL', newUrl);
    return newUrl;
  }

  public getSocialPosts() {
    this.loading = true;
    this.apiService
      .getBusinessSocialPosts(this.businessId)
      .then((socialPosts: any) => {
        const socialPostsParsed = socialPosts.map((post: any, idx: number) => {
          const url = post.url.includes('?') ? post.url.replace('?', 'embed?') : 
            post.url + (post.url.endsWith('/') ? '' : '/') + 'embed?utm_source=ig_web_copy_link';
          return { ...post, url: this._sanitizer.bypassSecurityTrustResourceUrl(url), _url: url, idx };
        });
        this.socialPosts$.next(socialPostsParsed);
        socialPostsParsed && socialPostsParsed.length && this.currentSocialPost$.next(socialPostsParsed[0]);
        this.iFrame();
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public openLink() {
    const a = (document?.getElementById("openLink") as HTMLAnchorElement);
    a?.click();
  }

  public open(link: string) {
    window.open(encodeURI(link), '_system')
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
          this.iFrame();
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
          this.iFrame();
        } else {
          this.socialPosts$.next([]);
          this.currentSocialPost$.next(undefined);
        }
        this.loading = false;
      });
  }

  public iFrame() {
    setTimeout(() => {
      const iframe = (document?.getElementById("frameSocial") as HTMLIFrameElement);
      iframe.style.height = "calc(100%)";
      iframe.contentWindow?.focus();
      iframe?.contentWindow?.document?.body?.addEventListener('click', (e) => {
        e.preventDefault();
        // window.open(this.currentSocialPost$.getValue().url, '_system');
        // alert("iframe clicked");
      });
    }, 300);
    return true;
  }
}
